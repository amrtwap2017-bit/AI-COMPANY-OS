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
