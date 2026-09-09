"""
Sprint 5 — Data Quality Router
GET /data-quality/report → full quality report with scores + recommendations
GET /data-quality/score  → quick overall score
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.data_quality.service import DataQualityEngine

router = APIRouter(prefix="/data-quality", tags=["Data Quality"])


def _svc(db: Session = Depends(get_db),
         hotel_id: str = Depends(get_hotel_id)) -> DataQualityEngine:
    return DataQualityEngine(db=db, hotel_id=hotel_id)


@router.get("/report")
def get_data_quality_report(
    current_user=Depends(get_current_user),
    svc: DataQualityEngine = Depends(_svc),
):
    """Full data quality report: scores per category + actionable recommendations."""
    return svc.get_full_report()


@router.get("/score")
def get_data_quality_score(
    current_user=Depends(get_current_user),
    svc: DataQualityEngine = Depends(_svc),
):
    """Quick overall data quality score (0-100) + grade."""
    report = svc.get_full_report()
    return {
        "hotel_id": report["hotel_id"],
        "overall_score": report["overall_score"],
        "grade": report["grade"],
        "summary": report["summary"],
        "top_recommendations": report["top_recommendations"][:3],
        "generated_at": report["generated_at"],
    }


@router.get("/confidence-report", summary="Data confidence report for all KPIs")
def get_confidence_report(
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    V7-004: Complete data confidence report.

    For every KPI, shows:
    - value: the calculated number
    - confidence: HIGH / MEDIUM / LOW / VERY_LOW
    - coverage_pct: what % of available data was used
    - records_used: actual records included
    - records_available: total records in scope
    - missing_data: what is excluded and why
    - formula: exact calculation method
    - recommendation: how to improve coverage

    The platform is transparent about data gaps.
    Low coverage = low confidence. This is honest intelligence.
    """
    from src.commercial.data_quality.confidence_engine import DataConfidenceEngine
    engine = DataConfidenceEngine(db=db, hotel_id=hotel_id)
    return engine.full_confidence_report()


@router.get("/lineage", summary="Data lineage for all intelligence metrics")
def get_data_lineage(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    V10-006: Returns data lineage for all key intelligence metrics.
    Every metric includes: value, confidence, sample_size, coverage, limitations.
    This enables transparent, trustworthy intelligence reporting.
    """
    from src.commercial.data_quality.lineage import (
        wo_asset_lineage, mttr_lineage, pm_compliance_lineage
    )
    from sqlalchemy import text

    def q(sql, p=None):
        return db.execute(text(sql), p or {}).scalar() or 0

    # Work Orders
    wo_total = q("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h", {"h": hotel_id})
    wo_linked = q("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND asset_id IS NOT NULL", {"h": hotel_id})
    wo_completed = q("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND status='completed'", {"h": hotel_id})
    wo_completed_linked = q(
        "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND status='completed' AND asset_id IS NOT NULL",
        {"h": hotel_id}
    )

    # PM Plans
    pm_total = q("SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h", {"h": hotel_id})
    pm_linked = q("SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h AND asset_node_id IS NOT NULL", {"h": hotel_id})
    pm_overdue = q(
        "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h AND status='active' AND next_due_date < CURRENT_DATE",
        {"h": hotel_id}
    )
    pm_completed = pm_total - pm_overdue if pm_total > pm_overdue else 0

    # MTTR
    mttr_result = db.execute(text("""
        SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600)
        FROM work_orders
        WHERE hotel_id=:h AND status='completed' AND asset_id IS NOT NULL
        AND completed_at IS NOT NULL AND completed_at > created_at
    """), {"h": hotel_id}).scalar()
    mttr_hours = round(float(mttr_result), 1) if mttr_result else None

    lineage = {
        "hotel_id": hotel_id,
        "generated_at": __import__("datetime").datetime.utcnow().isoformat(),
        "metrics": {
            "wo_asset_linkage": wo_asset_lineage(wo_total, wo_linked, mttr_hours).to_dict(),
            "mttr": mttr_lineage(wo_completed, wo_completed_linked, mttr_hours).to_dict(),
            "pm_compliance": pm_compliance_lineage(pm_total, pm_completed, pm_linked).to_dict(),
        },
        "summary": {
            "overall_confidence": "LOW" if wo_linked/max(wo_total,1) < 0.2 else
                                  "MEDIUM" if wo_linked/max(wo_total,1) < 0.6 else "HIGH",
            "wo_asset_coverage": round(wo_linked/max(wo_total,1)*100, 1),
            "pm_asset_coverage": round(pm_linked/max(pm_total,1)*100, 1),
            "primary_limitation": "WO→Asset linkage too low for reliable intelligence" if wo_linked/max(wo_total,1) < 0.3 else "Data quality acceptable",
        }
    }
    return lineage

