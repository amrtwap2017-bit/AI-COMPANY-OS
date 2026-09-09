"""
V6-E02 — Evidence/Recommendation Framework
Closes the Intelligence → Decision → Measurement loop.

Recommendations are generated from AI Directors, persisted,
and tracked through human review → approve/reject → outcome.

Table: recommendations (created on first use)
"""
from __future__ import annotations
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger("tb.recommendations")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _now_iso() -> str:
    return _now().isoformat()


class RecommendationService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id
        self._ensure_table()

    def _ensure_table(self) -> None:
        """Create recommendations table if it does not exist."""
        try:
            self.db.execute(text("""
                CREATE TABLE IF NOT EXISTS recommendations (
                    id              VARCHAR PRIMARY KEY,
                    hotel_id        VARCHAR NOT NULL,
                    director        VARCHAR NOT NULL,
                    audit_id        VARCHAR NOT NULL,
                    risk_level      VARCHAR NOT NULL,
                    risk_score      NUMERIC(5,1) DEFAULT 0,
                    recommendation  TEXT NOT NULL,
                    evidence        TEXT NOT NULL,
                    reasoning       TEXT,
                    confidence_score NUMERIC(4,2) DEFAULT 0.80,
                    expected_impact TEXT,
                    action          VARCHAR NOT NULL DEFAULT 'MONITOR',
                    source_data     TEXT,
                    status          VARCHAR NOT NULL DEFAULT 'pending',
                    reviewed_by     VARCHAR,
                    review_notes    TEXT,
                    reviewed_at     TIMESTAMP,
                    generated_at    TIMESTAMP NOT NULL,
                    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
                )
            """))
            self.db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_rec_hotel_status
                ON recommendations (hotel_id, status)
            """))
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.warning(f"Table ensure warning: {e}")

    # ── GENERATE ─────────────────────────────────────────────────────────────

    def generate_from_directors(self) -> Dict[str, Any]:
        """
        Run all 4 AI Directors and persist their recommendations.
        Returns: list of generated recommendation IDs.
        """
        from src.commercial.ai_directors.service import AIDirectorsService
        directors_svc = AIDirectorsService(db=self.db, hotel_id=self.hotel_id)

        generated = []
        for director_type in ["maintenance", "procurement", "operations", "executive"]:
            try:
                result = directors_svc.analyze_director(director_type, {})
                rec_id = self._store_recommendation(result)
                generated.append({
                    "id": rec_id,
                    "director": director_type,
                    "risk_level": result.get("risk_level"),
                    "action": result.get("action"),
                })
            except Exception as e:
                logger.error(f"Failed to generate {director_type} recommendation: {e}")

        return {
            "hotel_id": self.hotel_id,
            "generated_count": len(generated),
            "recommendations": generated,
            "generated_at": _now_iso(),
        }

    def _store_recommendation(self, director_output: Dict[str, Any]) -> str:
        """Persist one director recommendation to the DB."""
        import json
        rec_id = str(uuid.uuid4())
        evidence_json = json.dumps(director_output.get("evidence", []))
        source_json = json.dumps(director_output.get("source_data", {}))

        self.db.execute(text("""
            INSERT INTO recommendations
              (id, hotel_id, director, audit_id, risk_level, risk_score,
               recommendation, evidence, reasoning, confidence_score,
               expected_impact, action, source_data, status, generated_at, created_at)
            VALUES
              (:id, :hotel_id, :director, :audit_id, :risk_level, :risk_score,
               :recommendation, :evidence, :reasoning, :confidence_score,
               :expected_impact, :action, :source_data, 'pending', :gen_at, NOW())
        """), {
            "id": rec_id,
            "hotel_id": self.hotel_id,
            "director": director_output.get("director", "Unknown"),
            "audit_id": director_output.get("audit_id", str(uuid.uuid4())),
            "risk_level": director_output.get("risk_level", "LOW"),
            "risk_score": director_output.get("risk_score", 0),
            "recommendation": director_output.get("recommendation", ""),
            "evidence": evidence_json,
            "reasoning": director_output.get("reasoning", ""),
            "confidence_score": director_output.get("confidence_score", 0.80),
            "expected_impact": director_output.get("expected_impact", ""),
            "action": director_output.get("action", "MONITOR"),
            "source_data": source_json,
            "gen_at": _now(),
        })
        self.db.commit()
        return rec_id

    # ── LIST ──────────────────────────────────────────────────────────────────

    def list_recommendations(self, status: Optional[str] = None,
                             limit: int = 20) -> Dict[str, Any]:
        """List recommendations for this hotel, optionally filtered by status."""
        import json
        where = "WHERE hotel_id = :h"
        params: Dict[str, Any] = {"h": self.hotel_id, "lim": limit}
        if status:
            where += " AND status = :status"
            params["status"] = status

        rows = self.db.execute(text(f"""
            SELECT id, director, risk_level, risk_score, recommendation,
                   evidence, confidence_score, action, status,
                   reviewed_by, reviewed_at, generated_at
            FROM recommendations
            {where}
            ORDER BY
                CASE risk_level
                    WHEN 'CRITICAL' THEN 1
                    WHEN 'HIGH' THEN 2
                    WHEN 'MEDIUM' THEN 3
                    ELSE 4
                END,
                generated_at DESC
            LIMIT :lim
        """), params).fetchall()

        items = []
        for r in rows:
            evidence = r[5]
            try:
                evidence = json.loads(r[5]) if isinstance(r[5], str) else r[5]
            except Exception:
                evidence = [r[5]] if r[5] else []
            items.append({
                "id": r[0],
                "director": r[1],
                "risk_level": r[2],
                "risk_score": float(r[3] or 0),
                "recommendation": r[4],
                "evidence": evidence,
                "confidence_score": float(r[6] or 0.80),
                "action": r[7],
                "status": r[8],
                "reviewed_by": r[9],
                "reviewed_at": str(r[10]) if r[10] else None,
                "generated_at": str(r[11]) if r[11] else None,
            })

        return {
            "hotel_id": self.hotel_id,
            "count": len(items),
            "status_filter": status or "all",
            "recommendations": items,
        }

    # ── GET ONE ───────────────────────────────────────────────────────────────

    def get_recommendation(self, rec_id: str) -> Optional[Dict[str, Any]]:
        """Get full recommendation with all evidence."""
        import json
        row = self.db.execute(text("""
            SELECT id, hotel_id, director, audit_id, risk_level, risk_score,
                   recommendation, evidence, reasoning, confidence_score,
                   expected_impact, action, source_data, status,
                   reviewed_by, review_notes, reviewed_at, generated_at
            FROM recommendations
            WHERE id = :id AND hotel_id = :h
        """), {"id": rec_id, "h": self.hotel_id}).fetchone()

        if not row:
            return None

        def _parse_json(val: Any) -> Any:
            try:
                return json.loads(val) if isinstance(val, str) else (val or [])
            except Exception:
                return val

        return {
            "id": row[0],
            "hotel_id": row[1],
            "director": row[2],
            "audit_id": row[3],
            "risk_level": row[4],
            "risk_score": float(row[5] or 0),
            "recommendation": row[6],
            "evidence": _parse_json(row[7]),
            "reasoning": row[8],
            "confidence_score": float(row[9] or 0.80),
            "expected_impact": row[10],
            "action": row[11],
            "source_data": _parse_json(row[12]),
            "status": row[13],
            "reviewed_by": row[14],
            "review_notes": row[15],
            "reviewed_at": str(row[16]) if row[16] else None,
            "generated_at": str(row[17]) if row[17] else None,
            "human_review_required": True,
            "governance_note": (
                "This recommendation requires human review and approval. "
                "AI advisory only — no automatic action is taken."
            ),
        }

    # ── APPROVE ───────────────────────────────────────────────────────────────

    def approve_recommendation(self, rec_id: str, reviewer: str,
                               notes: str = "") -> Dict[str, Any]:
        """
        Human approves recommendation.
        Records decision — does NOT automatically execute any action.
        Execution is a separate human-initiated step.
        """
        row = self.db.execute(text("""
            SELECT id, status, action FROM recommendations
            WHERE id = :id AND hotel_id = :h
        """), {"id": rec_id, "h": self.hotel_id}).fetchone()

        if not row:
            return {"error": "Recommendation not found", "id": rec_id}
        if row[1] == "approved":
            return {"error": "Already approved", "id": rec_id,
                    "status": "approved"}

        self.db.execute(text("""
            UPDATE recommendations
            SET status = 'approved',
                reviewed_by = :reviewer,
                review_notes = :notes,
                reviewed_at = NOW()
            WHERE id = :id AND hotel_id = :h
        """), {"id": rec_id, "h": self.hotel_id,
               "reviewer": reviewer, "notes": notes})
        self.db.commit()

        return {
            "id": rec_id,
            "status": "approved",
            "reviewed_by": reviewer,
            "notes": notes,
            "action_required": row[2],
            "approved_at": _now_iso(),
            "next_step": (
                f"Recommendation approved. "
                f"Execute action '{row[2]}' as per operational procedure."
            ),
        }

    # ── REJECT ────────────────────────────────────────────────────────────────

    def reject_recommendation(self, rec_id: str, reviewer: str,
                              reason: str) -> Dict[str, Any]:
        """Human rejects recommendation with reason."""
        row = self.db.execute(text("""
            SELECT id, status FROM recommendations
            WHERE id = :id AND hotel_id = :h
        """), {"id": rec_id, "h": self.hotel_id}).fetchone()

        if not row:
            return {"error": "Recommendation not found", "id": rec_id}

        self.db.execute(text("""
            UPDATE recommendations
            SET status = 'rejected',
                reviewed_by = :reviewer,
                review_notes = :reason,
                reviewed_at = NOW()
            WHERE id = :id AND hotel_id = :h
        """), {"id": rec_id, "h": self.hotel_id,
               "reviewer": reviewer, "reason": reason})
        self.db.commit()

        return {
            "id": rec_id,
            "status": "rejected",
            "reviewed_by": reviewer,
            "rejection_reason": reason,
            "rejected_at": _now_iso(),
        }

    # ── HISTORY ───────────────────────────────────────────────────────────────

    def get_history(self, limit: int = 20) -> Dict[str, Any]:
        """Return reviewed (approved/rejected) recommendation history."""
        rows = self.db.execute(text("""
            SELECT id, director, risk_level, recommendation, action,
                   status, reviewed_by, review_notes, reviewed_at
            FROM recommendations
            WHERE hotel_id = :h AND status IN ('approved','rejected')
            ORDER BY reviewed_at DESC
            LIMIT :lim
        """), {"h": self.hotel_id, "lim": limit}).fetchall()

        return {
            "hotel_id": self.hotel_id,
            "count": len(rows),
            "history": [
                {
                    "id": r[0],
                    "director": r[1],
                    "risk_level": r[2],
                    "recommendation": r[3][:100] + "..." if len(r[3]) > 100 else r[3],
                    "action": r[4],
                    "status": r[5],
                    "reviewed_by": r[6],
                    "review_notes": r[7],
                    "reviewed_at": str(r[8]) if r[8] else None,
                }
                for r in rows
            ],
        }

    # ── SUMMARY ───────────────────────────────────────────────────────────────


    def _ensure_outcomes_table(self) -> None:
        """Create recommendation_outcomes table if not exists."""
        try:
            self.db.execute(text("""
                CREATE TABLE IF NOT EXISTS recommendation_outcomes (
                    id                  VARCHAR PRIMARY KEY,
                    recommendation_id   VARCHAR NOT NULL,
                    hotel_id            VARCHAR NOT NULL,
                    outcome_type        VARCHAR NOT NULL,
                    metric_key          VARCHAR,
                    metric_before       NUMERIC,
                    metric_after        NUMERIC,
                    notes               TEXT,
                    recorded_by         VARCHAR,
                    recorded_at         TIMESTAMP DEFAULT NOW(),
                    created_at          TIMESTAMP DEFAULT NOW()
                )
            """))
            self.db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_rec_outcomes_rec_id
                ON recommendation_outcomes(recommendation_id)
            """))
            self.db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_rec_outcomes_hotel
                ON recommendation_outcomes(hotel_id)
            """))
            self.db.commit()
        except Exception as e:
            try: self.db.rollback()
            except: pass
            logger.warning(f"outcomes table ensure: {e}")

    def record_outcome(self, recommendation_id: str, hotel_id: str,
                       outcome_type: str, metric_key: str = None,
                       metric_before: float = None, metric_after: float = None,
                       notes: str = None, recorded_by: str = None) -> dict:
        """
        Record the outcome of an approved recommendation.
        outcome_type: improved | unchanged | worse | unknown
        """
        import uuid as _uuid
        VALID_OUTCOMES = {"improved", "unchanged", "worse", "unknown"}
        if outcome_type not in VALID_OUTCOMES:
            outcome_type = "unknown"

        self._ensure_outcomes_table()

        # Verify recommendation exists and belongs to hotel
        rec = self.db.execute(text("""
            SELECT id, status, director, recommendation
            FROM recommendations
            WHERE id = :rid AND hotel_id = :hid
        """), {"rid": recommendation_id, "hid": hotel_id}).fetchone()

        if not rec:
            return {"success": False, "error": "Recommendation not found"}

        outcome_id = str(_uuid.uuid4())
        try:
            self.db.execute(text("""
                INSERT INTO recommendation_outcomes
                  (id, recommendation_id, hotel_id, outcome_type,
                   metric_key, metric_before, metric_after,
                   notes, recorded_by, recorded_at, created_at)
                VALUES
                  (:id, :rid, :hid, :otype,
                   :mkey, :mbefore, :mafter,
                   :notes, :by, NOW(), NOW())
            """), {
                "id": outcome_id,
                "rid": recommendation_id,
                "hid": hotel_id,
                "otype": outcome_type,
                "mkey": metric_key,
                "mbefore": metric_before,
                "mafter": metric_after,
                "notes": notes,
                "by": recorded_by or "system",
            })
            self.db.commit()

            improvement_pct = None
            if metric_before and metric_after and metric_before != 0:
                improvement_pct = round(
                    (metric_after - metric_before) / abs(metric_before) * 100, 1
                )

            return {
                "success": True,
                "outcome_id": outcome_id,
                "recommendation_id": recommendation_id,
                "outcome_type": outcome_type,
                "improvement_pct": improvement_pct,
                "message": f"Outcome recorded: {outcome_type}",
            }
        except Exception as e:
            try: self.db.rollback()
            except: pass
            logger.error(f"record_outcome failed: {e}")
            return {"success": False, "error": str(e)[:200]}

    def get_effectiveness(self, hotel_id: str) -> dict:
        """
        Calculate AI recommendation effectiveness metrics.
        Answers: "How accurate are the AI recommendations?"
        """
        self._ensure_outcomes_table()

        # Total recommendations generated
        total = self.db.execute(text("""
            SELECT COUNT(*) FROM recommendations WHERE hotel_id = :h
        """), {"h": hotel_id}).scalar() or 0

        # Approved (acted upon)
        approved = self.db.execute(text("""
            SELECT COUNT(*) FROM recommendations
            WHERE hotel_id = :h AND status = 'approved'
        """), {"h": hotel_id}).scalar() or 0

        # Rejected
        rejected = self.db.execute(text("""
            SELECT COUNT(*) FROM recommendations
            WHERE hotel_id = :h AND status = 'rejected'
        """), {"h": hotel_id}).scalar() or 0

        # Outcomes recorded
        try:
            outcomes = self.db.execute(text("""
                SELECT
                    outcome_type,
                    COUNT(*) as cnt
                FROM recommendation_outcomes
                WHERE hotel_id = :h
                GROUP BY outcome_type
            """), {"h": hotel_id}).fetchall()
            outcome_counts = {r[0]: int(r[1]) for r in outcomes}
        except Exception:
            try: self.db.rollback()
            except: pass
            outcome_counts = {}

        total_outcomes = sum(outcome_counts.values())
        improved = outcome_counts.get("improved", 0)
        unchanged = outcome_counts.get("unchanged", 0)
        worse = outcome_counts.get("worse", 0)
        unknown = outcome_counts.get("unknown", 0)

        effectiveness_rate = round(
            improved / max(total_outcomes, 1) * 100, 1
        ) if total_outcomes > 0 else None

        # Director breakdown
        try:
            director_stats = self.db.execute(text("""
                SELECT
                    r.director,
                    COUNT(r.id) as total,
                    COUNT(CASE WHEN r.status='approved' THEN 1 END) as approved,
                    ROUND(AVG(r.confidence_score)::numeric, 2) as avg_confidence
                FROM recommendations r
                WHERE r.hotel_id = :h
                GROUP BY r.director
                ORDER BY total DESC
            """), {"h": hotel_id}).fetchall()
            by_director = {}
            for row in director_stats:
                d = dict(row._mapping)
                director = d.get("director", "unknown")
                by_director[director] = {
                    "total": int(d.get("total") or 0),
                    "approved": int(d.get("approved") or 0),
                    "approval_rate_pct": round(
                        int(d.get("approved") or 0) /
                        max(int(d.get("total") or 1), 1) * 100, 1
                    ),
                    "avg_confidence": float(d.get("avg_confidence") or 0),
                }
        except Exception:
            try: self.db.rollback()
            except: pass
            by_director = {}

        return {
            "hotel_id": hotel_id,
            "summary": {
                "total_recommendations": total,
                "acted_upon": approved,
                "rejected": rejected,
                "pending": total - approved - rejected,
                "acceptance_rate_pct": round(
                    approved / max(total, 1) * 100, 1
                ),
            },
            "outcomes": {
                "total_measured": total_outcomes,
                "improved": improved,
                "unchanged": unchanged,
                "worse": worse,
                "unknown": unknown,
                "effectiveness_rate_pct": effectiveness_rate,
                "measurement_coverage_pct": round(
                    total_outcomes / max(approved, 1) * 100, 1
                ) if approved > 0 else 0.0,
            },
            "by_director": by_director,
            "governance": {
                "human_review_required": True,
                "all_recommendations_governed": True,
                "model_used": "rule-based-v2-db",
            },
        }



    def get_daily_digest(self, hotel_id: str, top_n: int = 5) -> dict:
        """
        V7-007: AI Governance — Daily Digest.
        Returns top N most actionable recommendations (not all 1,460).

        Solves recommendation fatigue:
        Instead of showing 1,460 pending items, show the 5 most important.
        Ordered by: CRITICAL first, then highest confidence_score.

        This is the primary entry point for daily AI advisory review.
        """
        self._ensure_table()

        # Get top N by priority + confidence
        try:
            rows = self.db.execute(text("""
                SELECT
                    id, director, risk_level, risk_score,
                    recommendation, expected_impact, action,
                    confidence_score, generated_at, status,
                    evidence, reasoning
                FROM recommendations
                WHERE hotel_id = :h AND status = 'pending'
                  AND generated_at >= NOW() - INTERVAL '30 days'
                ORDER BY
                    CASE risk_level
                        WHEN 'CRITICAL' THEN 1
                        WHEN 'HIGH' THEN 2
                        WHEN 'MEDIUM' THEN 3
                        ELSE 4
                    END,
                    confidence_score DESC,
                    generated_at DESC
                LIMIT :n
            """), {"h": hotel_id, "n": top_n}).fetchall()
        except Exception as e:
            try: self.db.rollback()
            except: pass
            return {"hotel_id": hotel_id, "digest": [], "error": str(e)[:200]}

        # Count totals for context
        total_pending = 0
        critical_count = 0
        stale_count = 0
        try:
            total_pending = self.db.execute(text(
                "SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h AND status='pending'"
            ), {"h": hotel_id}).scalar() or 0
            critical_count = self.db.execute(text(
                "SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h "
                "AND status='pending' AND risk_level='CRITICAL'"
            ), {"h": hotel_id}).scalar() or 0
            stale_count = self.db.execute(text(
                "SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h "
                "AND status='pending' AND generated_at < NOW() - INTERVAL '30 days'"
            ), {"h": hotel_id}).scalar() or 0
        except Exception:
            try: self.db.rollback()
            except: pass

        digest = []
        for row in rows:
            d = dict(row._mapping)
            conf = float(d.get("confidence_score") or 0.5)
            conf_level = (
                "HIGH" if conf >= 0.8 else
                "MEDIUM" if conf >= 0.6 else
                "LOW" if conf >= 0.3 else "VERY_LOW"
            )
            digest.append({
                "recommendation_id": d.get("id"),
                "director": d.get("director"),
                "risk_level": d.get("risk_level"),
                "recommendation": d.get("recommendation"),
                "expected_impact": d.get("expected_impact"),
                "action": d.get("action"),
                "confidence": conf_level,
                "confidence_score": conf,
                "evidence_available": bool(d.get("evidence")),
                "reasoning_available": bool(d.get("reasoning")),
                "generated_at": str(d.get("generated_at", ""))[:19],
                "approve_url": f"/api/v1/recommendations/{d.get('id')}/approve",
                "reject_url": f"/api/v1/recommendations/{d.get('id')}/reject",
                "detail_url": f"/api/v1/recommendations/{d.get('id')}",
            })

        return {
            "hotel_id": hotel_id,
            "report_type": "DAILY_DIGEST",
            "digest_size": len(digest),
            "total_pending": int(total_pending),
            "critical_count": int(critical_count),
            "stale_count": int(stale_count),
            "showing_top": top_n,
            "fatigue_note": (
                f"Showing top {len(digest)} of {int(total_pending)} pending recommendations. "
                f"Review daily to keep the queue actionable."
                if int(total_pending) > top_n else
                f"All {int(total_pending)} pending recommendations shown."
            ),
            "governance_note": "All items require human review before action. AI advisory only.",
            "digest": digest,
        }

    def get_director_performance(self, hotel_id: str) -> dict:
        """
        V7-007: AI Director performance tracking.
        Shows which directors generate the most accepted recommendations.
        Helps identify which AI signals are most valuable to users.
        """
        self._ensure_table()

        try:
            rows = self.db.execute(text("""
                SELECT
                    director,
                    COUNT(*) as total,
                    COUNT(CASE WHEN status='approved' THEN 1 END) as approved,
                    COUNT(CASE WHEN status='rejected' THEN 1 END) as rejected,
                    COUNT(CASE WHEN status='pending' THEN 1 END) as pending,
                    ROUND(AVG(confidence_score)::numeric, 3) as avg_confidence,
                    ROUND(AVG(risk_score)::numeric, 1) as avg_risk_score
                FROM recommendations
                WHERE hotel_id = :h
                GROUP BY director
                ORDER BY approved DESC, total DESC
            """), {"h": hotel_id}).fetchall()
        except Exception as e:
            try: self.db.rollback()
            except: pass
            return {"hotel_id": hotel_id, "directors": [], "error": str(e)[:200]}

        # Check outcome effectiveness per director
        directors = []
        for row in rows:
            d = dict(row._mapping)
            total = int(d.get("total") or 0)
            approved = int(d.get("approved") or 0)
            rejected = int(d.get("rejected") or 0)

            acceptance_rate = round(approved / max(total, 1) * 100, 1)
            rejection_rate = round(rejected / max(total, 1) * 100, 1)

            # Count outcomes for this director
            outcome_count = 0
            try:
                outcome_count = self.db.execute(text("""
                    SELECT COUNT(*) FROM recommendation_outcomes ro
                    JOIN recommendations r ON ro.recommendation_id = r.id
                    WHERE r.hotel_id = :h AND r.director = :dir
                """), {"h": hotel_id, "dir": d.get("director")}).scalar() or 0
            except Exception:
                try: self.db.rollback()
                except: pass

            directors.append({
                "director": d.get("director"),
                "total_generated": total,
                "approved": approved,
                "rejected": rejected,
                "pending": int(d.get("pending") or 0),
                "acceptance_rate_pct": acceptance_rate,
                "rejection_rate_pct": rejection_rate,
                "outcomes_recorded": int(outcome_count),
                "avg_confidence": float(d.get("avg_confidence") or 0),
                "avg_risk_score": float(d.get("avg_risk_score") or 0),
                "effectiveness_grade": (
                    "A" if acceptance_rate >= 50 else
                    "B" if acceptance_rate >= 30 else
                    "C" if acceptance_rate >= 15 else
                    "D"
                ),
            })

        total_generated = sum(d["total_generated"] for d in directors)
        total_approved = sum(d["approved"] for d in directors)
        overall_rate = round(total_approved / max(total_generated, 1) * 100, 1)

        return {
            "hotel_id": hotel_id,
            "report_type": "DIRECTOR_PERFORMANCE",
            "total_recommendations": total_generated,
            "total_approved": total_approved,
            "overall_acceptance_rate_pct": overall_rate,
            "directors": directors,
            "insight": (
                "Low acceptance rate may indicate: "
                "(1) recommendations not reaching reviewers, "
                "(2) insufficient evidence, or "
                "(3) recommendations not matching operational priorities."
            ) if overall_rate < 20 else
            "Acceptance rate is healthy. Continue monitoring.",
        }

    def expire_stale_recommendations(self, hotel_id: str, days: int = 30) -> dict:
        """
        V7-007: Mark stale pending recommendations as expired.
        Recommendations older than N days that are still pending are
        likely no longer relevant. Move to 'expired' status.
        Note: Does NOT delete — preserves audit trail.
        """
        self._ensure_table()

        try:
            # Count stale items first
            stale_count = self.db.execute(text("""
                SELECT COUNT(*) FROM recommendations
                WHERE hotel_id = :h AND status = 'pending'
                AND generated_at < NOW() - INTERVAL ':days days'
            """.replace(":days", str(days))), {"h": hotel_id}).scalar() or 0

            if stale_count == 0:
                return {
                    "hotel_id": hotel_id,
                    "expired": 0,
                    "message": f"No stale recommendations (older than {days} days) found.",
                }

            # Mark as expired
            self.db.execute(text("""
                UPDATE recommendations
                SET status = 'expired',
                    review_notes = :note,
                    reviewed_at = NOW()
                WHERE hotel_id = :h AND status = 'pending'
                AND generated_at < NOW() - INTERVAL ':days days'
            """.replace(":days", str(days))), {
                "h": hotel_id,
                "note": f"Auto-expired after {days} days without review (V7-007 governance)"
            })
            self.db.commit()

            return {
                "hotel_id": hotel_id,
                "expired": int(stale_count),
                "days_threshold": days,
                "message": f"Marked {stale_count} stale recommendations as expired.",
                "note": "Expired items preserved in audit trail. Not deleted.",
            }
        except Exception as e:
            try: self.db.rollback()
            except: pass
            return {"hotel_id": hotel_id, "expired": 0, "error": str(e)[:200]}

    def get_action_queue(self, hotel_id: str, limit: int = 20) -> dict:
        """
        V7-006: Intelligence → Action Queue.
        Returns actionable recommendations ordered by business priority.
        
        Priority scoring:
          CRITICAL + high confidence = P0 (act today)
          CRITICAL + medium confidence = P1 (act this week)
          HIGH + any confidence = P2 (act this month)
          MEDIUM = P3 (plan)
        
        This closes the loop:
        Signal → Recommendation → ACTION QUEUE → Human → Outcome
        """
        self._ensure_table()
        
        # Priority mapping
        PRIORITY = {
            ("CRITICAL", "HIGH"): ("P0", "Act today"),
            ("CRITICAL", "MEDIUM"): ("P0", "Act today"),
            ("CRITICAL", "LOW"): ("P1", "Act this week"),
            ("CRITICAL", "VERY_LOW"): ("P1", "Act this week"),
            ("HIGH", "HIGH"): ("P1", "Act this week"),
            ("HIGH", "MEDIUM"): ("P1", "Act this week"),
            ("HIGH", "LOW"): ("P2", "Act this month"),
            ("HIGH", "VERY_LOW"): ("P2", "Act this month"),
            ("MEDIUM", "HIGH"): ("P2", "Act this month"),
            ("MEDIUM", "MEDIUM"): ("P3", "Plan"),
            ("MEDIUM", "LOW"): ("P3", "Plan"),
            ("LOW", "HIGH"): ("P3", "Plan"),
        }
        
        try:
            rows = self.db.execute(text("""
                SELECT 
                    id, director, risk_level, risk_score,
                    recommendation, expected_impact, action,
                    confidence_score, generated_at, status
                FROM recommendations
                WHERE hotel_id = :h AND status = 'pending'
                ORDER BY 
                    CASE risk_level 
                        WHEN 'CRITICAL' THEN 1
                        WHEN 'HIGH' THEN 2
                        WHEN 'MEDIUM' THEN 3
                        ELSE 4
                    END,
                    risk_score DESC,
                    confidence_score DESC
                LIMIT :lim
            """), {"h": hotel_id, "lim": limit}).fetchall()
        except Exception as e:
            try: self.db.rollback()
            except: pass
            return {"hotel_id": hotel_id, "action_queue": [], "error": str(e)[:200]}
        
        queue = []
        p0_count = 0
        p1_count = 0
        
        for row in rows:
            d = dict(row._mapping)
            risk = d.get("risk_level", "MEDIUM") or "MEDIUM"
            conf_score = float(d.get("confidence_score") or 0.5)
            
            # Map confidence score to level
            if conf_score >= 0.8:
                conf_level = "HIGH"
            elif conf_score >= 0.6:
                conf_level = "MEDIUM"
            elif conf_score >= 0.3:
                conf_level = "LOW"
            else:
                conf_level = "VERY_LOW"
            
            priority_info = PRIORITY.get(
                (risk, conf_level),
                ("P3", "Plan")
            )
            priority, timing = priority_info
            
            if priority == "P0":
                p0_count += 1
            elif priority == "P1":
                p1_count += 1
            
            queue.append({
                "recommendation_id": d.get("id"),
                "priority": priority,
                "timing": timing,
                "director": d.get("director"),
                "risk_level": risk,
                "confidence": conf_level,
                "confidence_score": conf_score,
                "recommendation": d.get("recommendation"),
                "expected_impact": d.get("expected_impact"),
                "action": d.get("action"),
                "approval_required": d.get("required_approval_role", "manager"),
                "status": d.get("status"),
                "generated_at": str(d.get("generated_at", ""))[:19],
                "review_url": f"/recommendations/{d.get('id')}",
            })
        
        # Count pending by priority
        total_pending = len([r for r in rows])
        
        return {
            "hotel_id": hotel_id,
            "report_type": "ACTION_QUEUE",
            "total_pending": total_pending,
            "p0_count": p0_count,
            "p1_count": p1_count,
            "urgent_count": p0_count + p1_count,
            "priority_summary": (
                f"{p0_count} actions needed today, "
                f"{p1_count} needed this week."
                if p0_count + p1_count > 0 else
                "No urgent actions. Review planned items."
            ),
            "governance_note": "All actions require human approval. AI advisory only.",
            "action_queue": queue,
        }

    def get_summary(self) -> Dict[str, Any]:
        """Dashboard summary of recommendations by status and risk level."""
        try:
            stats = self.db.execute(text("""
                SELECT
                    COUNT(*) AS total,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending,
                    COUNT(CASE WHEN status = 'approved' THEN 1 END) AS approved,
                    COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rejected,
                    COUNT(CASE WHEN risk_level = 'CRITICAL'
                               AND status = 'pending' THEN 1 END) AS critical_pending,
                    COUNT(CASE WHEN risk_level = 'HIGH'
                               AND status = 'pending' THEN 1 END) AS high_pending
                FROM recommendations WHERE hotel_id = :h
            """), {"h": self.hotel_id}).fetchone()

            return {
                "hotel_id": self.hotel_id,
                "total": int(stats[0] or 0),
                "pending": int(stats[1] or 0),
                "approved": int(stats[2] or 0),
                "rejected": int(stats[3] or 0),
                "critical_pending": int(stats[4] or 0),
                "high_pending": int(stats[5] or 0),
                "attention_required": int(stats[4] or 0) + int(stats[5] or 0),
                "generated_at": _now_iso(),
            }
        except Exception as e:
            return {"hotel_id": self.hotel_id, "error": str(e),
                    "total": 0, "pending": 0}
