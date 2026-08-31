"""
V7-004 — Data Quality Confidence Engine
Triangle Black — Data Trust Framework

Every KPI must disclose:
  value       — the calculated number
  confidence  — HIGH / MEDIUM / LOW / VERY_LOW
  coverage    — what % of available data was used
  source      — which tables/fields
  gaps        — what data is missing
  formula     — how the value was calculated

Rules:
  coverage >= 85% → HIGH confidence
  coverage >= 60% → MEDIUM confidence
  coverage >= 30% → LOW confidence
  coverage <  30% → VERY_LOW confidence

This engine never hides missing data.
It makes the platform honest about what it knows vs estimates.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging

logger = logging.getLogger("tb.data_quality.confidence")


@dataclass
class KPIConfidence:
    """Confidence metadata for a single KPI."""
    kpi_id: str
    label: str
    value: Optional[float]
    unit: str
    confidence: str          # HIGH / MEDIUM / LOW / VERY_LOW / UNKNOWN
    confidence_reason: str
    coverage_pct: float
    records_used: int
    records_available: int
    missing_data: str
    formula: str
    source_tables: list
    recommendation: str
    hotel_id: str

    def to_dict(self) -> dict:
        return {
            "kpi_id": self.kpi_id,
            "label": self.label,
            "value": self.value,
            "unit": self.unit,
            "confidence": self.confidence,
            "confidence_reason": self.confidence_reason,
            "coverage_pct": round(self.coverage_pct, 1),
            "records_used": self.records_used,
            "records_available": self.records_available,
            "missing_data": self.missing_data,
            "formula": self.formula,
            "source_tables": self.source_tables,
            "recommendation": self.recommendation,
            "hotel_id": self.hotel_id,
        }


def _confidence_level(coverage_pct: float) -> str:
    """Map coverage percentage to confidence label."""
    if coverage_pct >= 85:
        return "HIGH"
    if coverage_pct >= 60:
        return "MEDIUM"
    if coverage_pct >= 30:
        return "LOW"
    if coverage_pct > 0:
        return "VERY_LOW"
    return "UNKNOWN"


def _safe_query(db: Session, sql: str, params: dict) -> int:
    """Execute a count query safely, returning 0 on error."""
    try:
        result = db.execute(text(sql), params).scalar()
        return int(result or 0)
    except Exception:
        try:
            db.rollback()
        except Exception:
            pass
        return 0


class DataConfidenceEngine:
    """
    Calculates confidence metadata for every Triangle Black KPI.

    Usage:
        engine = DataConfidenceEngine(db=db, hotel_id=hotel_id)
        report = engine.full_confidence_report()
    """

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.h = hotel_id

    def wo_asset_linkage_confidence(self) -> KPIConfidence:
        """
        WO→Asset linkage: what % of work orders are linked to assets.
        This is the foundational data quality metric — it limits
        MTTR, critical path, and repeat failure accuracy.
        """
        total_wos = _safe_query(
            self.db,
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h",
            {"h": self.h}
        )
        linked_wos = _safe_query(
            self.db,
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND asset_id IS NOT NULL",
            {"h": self.h}
        )
        coverage = round(linked_wos / max(total_wos, 1) * 100, 1)
        unlinked = total_wos - linked_wos
        conf = _confidence_level(coverage)

        return KPIConfidence(
            kpi_id="wo_asset_linkage",
            label="Work Order → Asset Linkage",
            value=coverage,
            unit="%",
            confidence=conf,
            confidence_reason=(
                f"Only {coverage}% of work orders are linked to assets. "
                f"MTTR, critical path, and repeat failure calculations "
                f"are based on this subset only."
                if coverage < 85 else
                f"{coverage}% of work orders are linked to assets."
            ),
            coverage_pct=coverage,
            records_used=linked_wos,
            records_available=total_wos,
            missing_data=(
                f"{unlinked} of {total_wos} work orders have no asset_id. "
                f"These are excluded from all asset-based intelligence."
                if unlinked > 0 else
                "All work orders are linked to assets."
            ),
            formula="COUNT(asset_id IS NOT NULL) / COUNT(*) × 100",
            source_tables=["work_orders"],
            recommendation=(
                "When creating work orders, always select the related asset. "
                "Import historical work orders with asset references to improve "
                "MTTR, critical path, and repeat failure accuracy."
                if coverage < 85 else
                "Asset linkage is good. Maintain this standard."
            ),
            hotel_id=self.h,
        )

    def mttr_confidence(self) -> KPIConfidence:
        """
        MTTR confidence — limited by WO-asset linkage AND completed_at validity.
        """
        total_completed = _safe_query(
            self.db,
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND status='completed'",
            {"h": self.h}
        )
        valid_mttr = _safe_query(
            self.db,
            """SELECT COUNT(*) FROM work_orders
               WHERE hotel_id=:h AND status='completed'
               AND completed_at IS NOT NULL AND completed_at > created_at
               AND asset_id IS NOT NULL""",
            {"h": self.h}
        )
        # Calculate actual MTTR for valid records
        mttr_value = None
        try:
            result = self.db.execute(text("""
                SELECT ROUND(AVG(
                    EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600.0
                )::numeric, 1)
                FROM work_orders
                WHERE hotel_id=:h AND status='completed'
                AND completed_at IS NOT NULL AND completed_at > created_at
                AND asset_id IS NOT NULL
            """), {"h": self.h}).scalar()
            mttr_value = float(result) if result else None
        except Exception:
            try:
                self.db.rollback()
            except Exception:
                pass

        coverage = round(valid_mttr / max(total_completed, 1) * 100, 1)
        conf = _confidence_level(coverage)

        return KPIConfidence(
            kpi_id="mttr",
            label="Mean Time To Repair (MTTR)",
            value=mttr_value,
            unit="hours",
            confidence=conf,
            confidence_reason=(
                f"MTTR calculated from {valid_mttr} of {total_completed} "
                f"completed WOs ({coverage}%). Excluded: WOs without asset_id "
                f"or invalid timestamps (completed_at ≤ created_at)."
            ),
            coverage_pct=coverage,
            records_used=valid_mttr,
            records_available=total_completed,
            missing_data=(
                f"{total_completed - valid_mttr} completed WOs excluded: "
                f"no asset linkage or invalid completion timestamps."
            ),
            formula=(
                "AVG(completed_at - created_at) WHERE asset_id IS NOT NULL "
                "AND completed_at > created_at AND status='completed'"
            ),
            source_tables=["work_orders"],
            recommendation=(
                "Link work orders to assets and ensure completed_at is recorded "
                "accurately to improve MTTR calculation coverage."
            ),
            hotel_id=self.h,
        )

    def pm_compliance_confidence(self) -> KPIConfidence:
        """
        PM Compliance confidence — based on PM plans with valid due dates.
        """
        total_plans = _safe_query(
            self.db,
            "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h",
            {"h": self.h}
        )
        with_due_date = _safe_query(
            self.db,
            """SELECT COUNT(*) FROM maintenance_plans
               WHERE hotel_id=:h AND next_due_date IS NOT NULL
               AND next_due_date != ''""",
            {"h": self.h}
        )
        on_schedule = _safe_query(
            self.db,
            """SELECT COUNT(*) FROM maintenance_plans
               WHERE hotel_id=:h
               AND (next_due_date IS NULL OR next_due_date = ''
                    OR next_due_date::DATE >= CURRENT_DATE
                    OR status = 'completed')""",
            {"h": self.h}
        )

        compliance_pct = round(on_schedule / max(total_plans, 1) * 100, 1)
        coverage = round(with_due_date / max(total_plans, 1) * 100, 1)
        conf = _confidence_level(coverage)

        return KPIConfidence(
            kpi_id="pm_compliance",
            label="Preventive Maintenance Compliance",
            value=compliance_pct,
            unit="%",
            confidence=conf,
            confidence_reason=(
                f"PM compliance calculated from {total_plans} plans. "
                f"{with_due_date} have valid due dates ({coverage}% coverage). "
                f"Plans without due dates are treated as 'not overdue'."
            ),
            coverage_pct=coverage,
            records_used=with_due_date,
            records_available=total_plans,
            missing_data=(
                f"{total_plans - with_due_date} PM plans have no next_due_date set. "
                f"These are excluded from overdue calculation."
                if total_plans - with_due_date > 0 else
                "All PM plans have due dates set."
            ),
            formula=(
                "COUNT(on_schedule OR completed) / COUNT(all_plans) × 100. "
                "On-schedule: next_due_date >= today OR status=completed."
            ),
            source_tables=["maintenance_plans"],
            recommendation=(
                "Set next_due_date on all PM plans for accurate compliance tracking."
                if coverage < 85 else
                "PM plan coverage is good."
            ),
            hotel_id=self.h,
        )

    def supplier_data_confidence(self) -> KPIConfidence:
        """Supplier data quality confidence."""
        total = _safe_query(
            self.db,
            "SELECT COUNT(*) FROM suppliers WHERE hotel_id=:h",
            {"h": self.h}
        )
        complete = _safe_query(
            self.db,
            """SELECT COUNT(*) FROM suppliers WHERE hotel_id=:h
               AND email IS NOT NULL AND email != ''
               AND phone IS NOT NULL AND phone != ''
               AND category IS NOT NULL AND category != ''""",
            {"h": self.h}
        )
        coverage = round(complete / max(total, 1) * 100, 1)
        conf = _confidence_level(coverage)

        return KPIConfidence(
            kpi_id="supplier_completeness",
            label="Supplier Data Completeness",
            value=coverage,
            unit="%",
            confidence=conf,
            confidence_reason=(
                f"{complete} of {total} suppliers have email + phone + category."
            ),
            coverage_pct=coverage,
            records_used=complete,
            records_available=total,
            missing_data=(
                f"{total - complete} suppliers are missing email, phone, or category."
                if total - complete > 0 else
                "All suppliers have complete contact data."
            ),
            formula="COUNT(email AND phone AND category IS NOT NULL) / COUNT(*) × 100",
            source_tables=["suppliers"],
            recommendation=(
                "Complete supplier contact information for accurate supplier intelligence."
                if coverage < 85 else
                "Supplier data completeness is good."
            ),
            hotel_id=self.h,
        )

    def recommendation_outcome_confidence(self) -> KPIConfidence:
        """AI recommendation outcome tracking coverage."""
        approved = _safe_query(
            self.db,
            "SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h AND status='approved'",
            {"h": self.h}
        )
        with_outcome = 0
        try:
            with_outcome = _safe_query(
                self.db,
                "SELECT COUNT(*) FROM recommendation_outcomes WHERE hotel_id=:h",
                {"h": self.h}
            )
        except Exception:
            pass

        coverage = round(with_outcome / max(approved, 1) * 100, 1)
        conf = _confidence_level(coverage)

        return KPIConfidence(
            kpi_id="recommendation_outcomes",
            label="AI Recommendation Outcome Tracking",
            value=coverage,
            unit="%",
            confidence=conf,
            confidence_reason=(
                f"{with_outcome} of {approved} approved recommendations have "
                f"recorded outcomes ({coverage}%). "
                f"AI effectiveness rate is based on this subset."
            ),
            coverage_pct=coverage,
            records_used=with_outcome,
            records_available=approved,
            missing_data=(
                f"{approved - with_outcome} approved recommendations have no "
                f"recorded outcome. AI effectiveness cannot be measured for these."
            ),
            formula="COUNT(outcomes recorded) / COUNT(approved) × 100",
            source_tables=["recommendations", "recommendation_outcomes"],
            recommendation=(
                "After acting on a recommendation, record the outcome "
                "via POST /recommendations/{id}/outcome to improve AI effectiveness tracking."
            ),
            hotel_id=self.h,
        )

    def full_confidence_report(self) -> dict:
        """
        Generate complete data confidence report for all KPIs.
        This is the V7-004 master data trust document.
        """
        kpis = [
            self.wo_asset_linkage_confidence(),
            self.mttr_confidence(),
            self.pm_compliance_confidence(),
            self.supplier_data_confidence(),
            self.recommendation_outcome_confidence(),
        ]

        # Overall data trust score
        coverages = [k.coverage_pct for k in kpis]
        overall_trust = round(sum(coverages) / len(coverages), 1)
        overall_conf = _confidence_level(overall_trust)

        # Count by confidence level
        by_confidence = {"HIGH": 0, "MEDIUM": 0, "LOW": 0, "VERY_LOW": 0, "UNKNOWN": 0}
        for k in kpis:
            by_confidence[k.confidence] = by_confidence.get(k.confidence, 0) + 1

        # Critical gaps (coverage < 30%)
        critical_gaps = [k for k in kpis if k.coverage_pct < 30]

        return {
            "hotel_id": self.h,
            "report_type": "DATA_CONFIDENCE_REPORT",
            "overall_data_trust_score": overall_trust,
            "overall_confidence": overall_conf,
            "kpi_count": len(kpis),
            "by_confidence": by_confidence,
            "critical_gaps": len(critical_gaps),
            "critical_gap_summary": [
                f"{k.label}: {k.coverage_pct}% coverage ({k.confidence})"
                for k in critical_gaps
            ],
            "platform_data_note": (
                "Triangle Black intelligence claims are based on available data only. "
                "Lower coverage = lower confidence. Improve data linkage to increase accuracy."
            ),
            "kpis": [k.to_dict() for k in kpis],
        }
