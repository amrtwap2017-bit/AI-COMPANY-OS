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

