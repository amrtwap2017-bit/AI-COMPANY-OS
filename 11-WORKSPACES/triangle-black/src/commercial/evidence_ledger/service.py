"""
Evidence Ledger Service — ROI Hierarchy Verification
Level 0: Internal/generated (AI only — NOT customer proof)
Level 1: System-measured (automatic before/after tracking)
Level 2: Operator-confirmed (engineer confirms action happened)
Level 3: Customer-confirmed (customer verifies outcome)
Level 4: Financially documented (CFO/GM signs off)

RULE: Only L3-L4 may appear in executive reports as real ROI.
"""
from __future__ import annotations
from typing import Dict, Any, Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
import uuid


EVIDENCE_LEVELS = {
    0: "INTERNAL",
    1: "SYSTEM_MEASURED",
    2: "OPERATOR_CONFIRMED",
    3: "CUSTOMER_VERIFIED",
    4: "FINANCIALLY_DOCUMENTED",
}

VALID_CONFIDENCE = ("HIGH", "MEDIUM", "LOW", "INSUFFICIENT")


class EvidenceLedgerService:
    """
    Single source of truth for ROI claims.
    Prevents internal evidence from being presented as customer proof.
    """

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id
        self._ensure_table()

    def _ensure_table(self):
        """Create evidence_records table if not exists — no Alembic required."""
        try:
            self.db.execute(text("""
                CREATE TABLE IF NOT EXISTS evidence_records (
                    id                   VARCHAR(36) PRIMARY KEY,
                    hotel_id             VARCHAR(100) NOT NULL,
                    recommendation_id    VARCHAR(36),
                    source_record_ids    TEXT,
                    metric_name          VARCHAR(100) NOT NULL,
                    baseline_value       FLOAT,
                    observed_value       FLOAT,
                    improvement_pct      FLOAT,
                    calculation_method   VARCHAR(200),
                    evidence_level       INTEGER NOT NULL DEFAULT 0,
                    evidence_label       VARCHAR(50) NOT NULL DEFAULT 'INTERNAL',
                    confidence           VARCHAR(20) DEFAULT 'MEDIUM',
                    human_verified       BOOLEAN DEFAULT FALSE,
                    human_verified_by    VARCHAR(100),
                    human_verified_at    TIMESTAMP,
                    customer_verified    BOOLEAN DEFAULT FALSE,
                    customer_verified_by VARCHAR(100),
                    customer_verified_at TIMESTAMP,
                    financial_value      FLOAT DEFAULT 0,
                    currency             VARCHAR(10) DEFAULT 'EGP',
                    approved_by          VARCHAR(100),
                    notes                TEXT,
                    created_at           TIMESTAMP DEFAULT NOW(),
                    updated_at           TIMESTAMP DEFAULT NOW()
                )
            """))
            self.db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_evidence_hotel_level
                ON evidence_records(hotel_id, evidence_level)
            """))
            self.db.commit()
        except Exception:
            self.db.rollback()

    def record_evidence(
        self,
        metric_name: str,
        evidence_level: int = 0,
        baseline_value: Optional[float] = None,
        observed_value: Optional[float] = None,
        financial_value: float = 0.0,
        recommendation_id: Optional[str] = None,
        calculation_method: str = "",
        confidence: str = "MEDIUM",
        notes: str = "",
        approved_by: str = "system",
    ) -> Dict[str, Any]:
        """Record a new evidence entry."""
        if evidence_level not in EVIDENCE_LEVELS:
            return {"success": False, "error": f"Invalid level {evidence_level}. Use 0-4."}
        if confidence not in VALID_CONFIDENCE:
            confidence = "MEDIUM"

        evidence_id = str(uuid.uuid4())
        now = datetime.utcnow()
        label = EVIDENCE_LEVELS[evidence_level]

        improvement_pct = None
        if baseline_value is not None and observed_value is not None and baseline_value != 0:
            improvement_pct = round((observed_value - baseline_value) / abs(baseline_value) * 100, 2)

        try:
            self.db.execute(text("""
                INSERT INTO evidence_records
                (id, hotel_id, recommendation_id, metric_name,
                 baseline_value, observed_value, improvement_pct,
                 calculation_method, evidence_level, evidence_label,
                 confidence, financial_value, currency, approved_by, notes,
                 created_at, updated_at)
                VALUES
                (:id, :h, :rec_id, :metric,
                 :baseline, :observed, :impv_pct,
                 :calc, :level, :label,
                 :conf, :financial, 'EGP', :approved, :notes,
                 :now, :now)
            """), {
                "id": evidence_id, "h": self.hotel_id,
                "rec_id": recommendation_id, "metric": metric_name,
                "baseline": baseline_value, "observed": observed_value,
                "impv_pct": improvement_pct, "calc": calculation_method,
                "level": evidence_level, "label": label,
                "conf": confidence, "financial": financial_value,
                "approved": approved_by, "notes": notes, "now": now,
            })
            self.db.commit()
            return {
                "success": True,
                "evidence_id": evidence_id,
                "level": evidence_level,
                "label": label,
                "financial_value": financial_value,
                "warning": "INTERNAL — not customer-verified" if evidence_level < 3 else None,
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)[:150]}

    def upgrade_evidence_level(
        self,
        evidence_id: str,
        new_level: int,
        actor: str,
        notes: str = "",
    ) -> Dict[str, Any]:
        """Upgrade evidence to higher verification level."""
        if new_level not in EVIDENCE_LEVELS:
            return {"success": False, "error": f"Invalid level {new_level}"}

        now = datetime.utcnow()
        updates: Dict[str, Any] = {
            "evidence_level": new_level,
            "evidence_label": EVIDENCE_LEVELS[new_level],
            "updated_at": now,
            "id": evidence_id,
            "h": self.hotel_id,
        }

        if new_level >= 2:
            updates["human_verified"] = True
            updates["human_verified_by"] = actor
            updates["human_verified_at"] = now
        if new_level >= 3:
            updates["customer_verified"] = True
            updates["customer_verified_by"] = actor
            updates["customer_verified_at"] = now

        try:
            self.db.execute(text("""
                UPDATE evidence_records
                SET evidence_level = :evidence_level,
                    evidence_label = :evidence_label,
                    human_verified = :human_verified,
                    human_verified_by = :human_verified_by,
                    human_verified_at = :human_verified_at,
                    customer_verified = :customer_verified,
                    customer_verified_by = :customer_verified_by,
                    customer_verified_at = :customer_verified_at,
                    updated_at = :updated_at
                WHERE id = :id AND hotel_id = :h
            """), {
                **updates,
                "human_verified": updates.get("human_verified", False),
                "human_verified_by": updates.get("human_verified_by"),
                "human_verified_at": updates.get("human_verified_at"),
                "customer_verified": updates.get("customer_verified", False),
                "customer_verified_by": updates.get("customer_verified_by"),
                "customer_verified_at": updates.get("customer_verified_at"),
            })
            self.db.commit()
            return {
                "success": True,
                "evidence_id": evidence_id,
                "new_level": new_level,
                "new_label": EVIDENCE_LEVELS[new_level],
                "actor": actor,
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)[:150]}

    def get_evidence_summary(self) -> Dict[str, Any]:
        """Summary of all evidence by level. Key: only L3+ is customer ROI."""
        try:
            rows = self.db.execute(text("""
                SELECT
                    evidence_level,
                    evidence_label,
                    COUNT(*) as count,
                    COALESCE(SUM(financial_value), 0) as total_financial
                FROM evidence_records
                WHERE hotel_id = :h
                GROUP BY evidence_level, evidence_label
                ORDER BY evidence_level
            """), {"h": self.hotel_id}).fetchall()

            by_level = {}
            total_internal = 0.0
            total_customer_verified = 0.0

            for row in rows:
                d = dict(row._mapping)
                level = d["evidence_level"]
                by_level[level] = {
                    "label": d["evidence_label"],
                    "count": int(d["count"]),
                    "financial_value_egp": float(d["total_financial"]),
                    "is_customer_verified": level >= 3,
                }
                if level < 3:
                    total_internal += float(d["total_financial"])
                else:
                    total_customer_verified += float(d["total_financial"])

            return {
                "hotel_id": self.hotel_id,
                "summary": {
                    "internal_roi_egp": total_internal,
                    "customer_verified_roi_egp": total_customer_verified,
                    "internal_label": "INTERNAL — not customer proof",
                    "customer_label": "CUSTOMER VERIFIED",
                },
                "by_level": by_level,
                "critical_rule": "Only L3+ (CUSTOMER_VERIFIED) may appear in executive reports",
                "generated_at": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            return {"error": str(e)[:100], "hotel_id": self.hotel_id}

    def get_verified_roi(self, min_level: int = 3) -> Dict[str, Any]:
        """Returns ONLY customer-verified ROI (L3+). Do NOT mix with internal."""
        try:
            rows = self.db.execute(text("""
                SELECT id, metric_name, baseline_value, observed_value,
                       improvement_pct, financial_value, evidence_level,
                       evidence_label, customer_verified_by, customer_verified_at, notes
                FROM evidence_records
                WHERE hotel_id = :h AND evidence_level >= :min_level
                ORDER BY financial_value DESC
            """), {"h": self.hotel_id, "min_level": min_level}).fetchall()

            records = [dict(r._mapping) for r in rows]
            total = sum(r.get("financial_value", 0) or 0 for r in records)

            return {
                "hotel_id": self.hotel_id,
                "minimum_level": min_level,
                "minimum_label": EVIDENCE_LEVELS.get(min_level, "CUSTOMER_VERIFIED"),
                "verified_records": len(records),
                "verified_roi_egp": float(total),
                "records": records,
                "honest_label": "CUSTOMER_VERIFIED ROI — safe for executive reporting",
                "generated_at": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            return {"error": str(e)[:100]}
