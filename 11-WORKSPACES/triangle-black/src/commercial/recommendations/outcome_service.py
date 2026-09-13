"""
P1-A: Recommendation Outcome Verification Service
Closes the DATA → DECISION → ACTION → OUTCOME → ROI loop.
"""
from __future__ import annotations
from typing import Dict, Any, List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import text


class RecommendationOutcomeService:
    """
    Records and verifies recommendation outcomes.
    Builds the ROI evidence chain:
    Approved → Actioned → Measured → Verified → ROI
    """

    VALID_OUTCOMES = ("improved", "no_change", "declined", "partial", "ongoing")
    VALID_OUTCOME_TYPES = (
        "COST_SAVED", "TIME_SAVED", "DOWNTIME_REDUCED", "FAILURE_AVOIDED",
        "PM_COMPLIANCE_IMPROVED", "PROCUREMENT_COST_REDUCED",
        "RESPONSE_TIME_IMPROVED", "QUALITY_IMPROVED", "RISK_REDUCED",
        "ENERGY_SAVED", "OTHER"
    )

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def record_outcome(
        self,
        rec_id: str,
        outcome: str,
        actor_name: str,
        notes: str = "",
        roi_impact: Optional[float] = None,
        outcome_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Record what happened after a recommendation was acted on.
        This is the central commercial proof mechanism.
        """
        if outcome not in self.VALID_OUTCOMES:
            return {
                "success": False,
                "error": f"Invalid outcome '{outcome}'. Must be one of: {self.VALID_OUTCOMES}"
            }

        # Verify rec exists and belongs to this hotel
        rec = self.db.execute(text("""
            SELECT id, director, recommendation, risk_level, status, duplicate_key
            FROM recommendations
            WHERE id=:id AND hotel_id=:h
        """), {"id": rec_id, "h": self.hotel_id}).fetchone()

        if not rec:
            return {"success": False, "error": "Recommendation not found"}

        d = dict(rec._mapping)

        if d.get("status") not in ("approved", "pending"):
            return {
                "success": False,
                "error": f"Can only record outcomes for approved/pending recommendations. Current status: {d.get('status')}"
            }

        now = datetime.utcnow()

        try:
            self.db.execute(text("""
                UPDATE recommendations
                SET outcome = :outcome,
                    outcome_notes = :notes,
                    roi_impact = :roi,
                    outcome_verified_at = :now,
                    outcome_by = :actor,
                    actioned_at = COALESCE(actioned_at, :now),
                    status = 'closed',
                    updated_at = :now
                WHERE id = :id AND hotel_id = :h
            """), {
                "outcome": outcome,
                "notes": notes,
                "roi": roi_impact,
                "now": now,
                "actor": actor_name,
                "id": rec_id,
                "h": self.hotel_id,
            })
            self.db.commit()

            return {
                "success": True,
                "rec_id": rec_id,
                "director": d.get("director"),
                "outcome": outcome,
                "outcome_type": outcome_type,
                "roi_impact_egp": roi_impact,
                "notes": notes,
                "verified_by": actor_name,
                "verified_at": now.isoformat(),
                "message": self._outcome_message(outcome, roi_impact),
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)[:200]}

    def get_outcomes_summary(self) -> Dict[str, Any]:
        """
        Complete outcomes summary — the commercial proof dashboard.
        Shows: what was recommended → what was done → what improved → ROI
        """
        h = self.hotel_id
        try:
            # Status distribution
            status_rows = self.db.execute(text("""
                SELECT status, COUNT(*) FROM recommendations
                WHERE hotel_id=:h GROUP BY status
            """), {"h": h}).fetchall()
            status_dist = {r[0]: r[1] for r in status_rows}

            # Outcome distribution
            outcome_rows = self.db.execute(text("""
                SELECT outcome, COUNT(*) FROM recommendations
                WHERE hotel_id=:h AND outcome IS NOT NULL
                GROUP BY outcome
            """), {"h": h}).fetchall()
            outcome_dist = {r[0]: r[1] for r in outcome_rows}

            # ROI summary
            roi_row = self.db.execute(text("""
                SELECT
                    COUNT(*) FILTER (WHERE outcome='improved') as improved,
                    COUNT(*) FILTER (WHERE outcome='partial') as partial,
                    COUNT(*) FILTER (WHERE outcome='no_change') as no_change,
                    COUNT(*) FILTER (WHERE outcome='declined') as declined,
                    COUNT(*) FILTER (WHERE outcome IS NOT NULL) as total_with_outcome,
                    COALESCE(SUM(roi_impact) FILTER (WHERE outcome IN ('improved','partial')), 0) as total_roi_egp,
                    COALESCE(SUM(roi_impact) FILTER (WHERE outcome='improved'), 0) as verified_roi_egp,
                    COUNT(*) FILTER (WHERE status='approved') as approved,
                    COUNT(*) FILTER (WHERE status='pending') as pending
                FROM recommendations WHERE hotel_id=:h
            """), {"h": h}).fetchone()

            r = dict(roi_row._mapping) if roi_row else {}

            total = sum(status_dist.values())
            approved = r.get("approved", 0)
            pending = r.get("pending", 0)
            actionable = approved + pending
            with_outcome = r.get("total_with_outcome", 0)

            return {
                "hotel_id": h,
                "generated_at": datetime.utcnow().isoformat(),

                "recommendation_funnel": {
                    "total_generated": int(total),
                    "pending_review": int(pending),
                    "approved": int(approved),
                    "rejected": int(status_dist.get("rejected", 0)),
                    "closed": int(status_dist.get("closed", 0)),
                    "archived": int(status_dist.get("archived", 0)),
                    "acceptance_rate_pct": round(approved / max(actionable, 1) * 100, 1),
                },

                "outcome_verification": {
                    "with_outcome": int(with_outcome),
                    "outcome_rate_pct": round(with_outcome / max(approved, 1) * 100, 1),
                    "improved": int(r.get("improved", 0)),
                    "partial": int(r.get("partial", 0)),
                    "no_change": int(r.get("no_change", 0)),
                    "declined": int(r.get("declined", 0)),
                },

                "roi_evidence": {
                    "total_roi_egp": float(r.get("total_roi_egp", 0)),
                    "verified_roi_egp": float(r.get("verified_roi_egp", 0)),
                    "roi_confidence": "VERIFIED" if with_outcome > 0 else "NOT_YET_MEASURED",
                    "note": (
                        f"{with_outcome} recommendations have verified outcomes"
                        if with_outcome > 0
                        else "Record outcomes as recommendations are actioned to build ROI evidence"
                    ),
                },

                "data_quality_note": (
                    "ROI evidence requires real pilot with customer recording outcomes"
                    if with_outcome == 0
                    else f"Based on {with_outcome} verified outcomes"
                ),
            }
        except Exception as e:
            return {"error": str(e)[:200]}

    def get_actionable_recommendations(self, limit: int = 20) -> Dict[str, Any]:
        """
        Return approved recommendations that need outcome recording.
        Prioritized by risk level and age.
        """
        try:
            rows = self.db.execute(text("""
                SELECT
                    id, director, recommendation, risk_level, urgency_level,
                    expected_impact, affected_asset_id, affected_wo_id,
                    confidence_score, created_at, duplicate_key
                FROM recommendations
                WHERE hotel_id=:h
                  AND status='approved'
                  AND outcome IS NULL
                ORDER BY
                    CASE risk_level
                        WHEN 'CRITICAL' THEN 1
                        WHEN 'HIGH' THEN 2
                        WHEN 'MEDIUM' THEN 3
                        ELSE 4
                    END,
                    created_at DESC
                LIMIT :limit
            """), {"h": self.hotel_id, "limit": limit}).fetchall()

            items = []
            seen_dupes = set()
            for row in rows:
                d = dict(row._mapping)
                dup_key = d.get("duplicate_key", "")
                # Deduplicate for display — show one of each type
                if dup_key and dup_key in seen_dupes:
                    continue
                if dup_key:
                    seen_dupes.add(dup_key)
                items.append({
                    "id": d["id"],
                    "director": d["director"],
                    "recommendation": (d["recommendation"] or "")[:120],
                    "risk_level": d["risk_level"],
                    "urgency_level": d.get("urgency_level"),
                    "expected_impact": (d.get("expected_impact") or "")[:80],
                    "affected_asset": d.get("affected_asset_id"),
                    "confidence": d.get("confidence_score"),
                    "days_since_approved": (datetime.utcnow() - d["created_at"]).days if d.get("created_at") else None,
                    "record_outcome_url": f"/api/v1/recommendations/{d['id']}/record-outcome",
                })

            return {
                "hotel_id": self.hotel_id,
                "actionable_count": len(items),
                "items": items,
                "instruction": "Record outcome via POST /api/v1/recommendations/{id}/record-outcome",
                "valid_outcomes": list(self.VALID_OUTCOMES),
            }
        except Exception as e:
            return {"error": str(e)[:200], "items": []}

    def _outcome_message(self, outcome: str, roi: Optional[float]) -> str:
        msgs = {
            "improved": f"✅ Improvement verified" + (f" — EGP {roi:,.0f} impact" if roi else ""),
            "partial": f"⚠️ Partial improvement recorded" + (f" — EGP {roi:,.0f} impact" if roi else ""),
            "no_change": "ℹ️ No change observed — recommendation may need revision",
            "declined": "❌ Outcome declined — action not taken or situation worsened",
            "ongoing": "🔄 Action in progress — outcome pending",
        }
        return msgs.get(outcome, "Outcome recorded")
