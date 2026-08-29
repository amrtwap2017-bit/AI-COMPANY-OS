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
