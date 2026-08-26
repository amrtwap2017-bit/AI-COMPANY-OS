"""
Asset Intelligence Router — Triangle Black A-004
NEW endpoints (do not duplicate asset_lifecycle or predictive_maintenance):
  GET /api/v1/asset-intelligence/summary    → Fleet overview + insights
  GET /api/v1/asset-intelligence/scores     → Per-asset health scores
  GET /api/v1/asset-intelligence/at-risk    → Rule-based failure prediction
  GET /api/v1/asset-intelligence/alerts     → Maintenance due alerts
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.asset_intelligence.service import AssetIntelligenceService

router = APIRouter(
    prefix="/asset-intelligence",
    tags=["Asset Intelligence"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/summary", summary="Asset Fleet Intelligence Summary")
def get_asset_intelligence_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Complete asset intelligence summary:
    fleet health score, grade distribution, maintenance alerts,
    at-risk assets, key insights.
    """
    svc = AssetIntelligenceService(db=db, hotel_id=hotel_id)
    return svc.summary()


@router.get("/scores", summary="Per-Asset Health Scores")
def get_asset_scores(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    limit: int = Query(default=50, le=200),
):
    """
    Returns health score (0-100) for each asset.
    Grade: A(80+) B(60+) C(40+) D(<40)
    Risk: LOW MODERATE HIGH CRITICAL
    Sorted: worst first (ascending health score).
    """
    svc = AssetIntelligenceService(db=db, hotel_id=hotel_id)
    scores = svc.health_score_per_asset(limit=limit)
    return {
        "hotel_id": hotel_id,
        "count": len(scores),
        "assets": scores
    }


@router.get("/at-risk", summary="At-Risk Assets (Rule-Based Prediction)")
def get_at_risk_assets(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Rule-based failure prediction. At-risk criteria:
    - Overdue for maintenance
    - Failed status
    - Critical criticality with open work orders
    - Critical + no valid warranty
    """
    svc = AssetIntelligenceService(db=db, hotel_id=hotel_id)
    at_risk = svc.at_risk_assets()
    return {
        "hotel_id": hotel_id,
        "at_risk_count": len(at_risk),
        "assets": at_risk
    }


@router.get("/alerts", summary="Maintenance Due Alerts")
def get_maintenance_alerts(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Maintenance alerts:
    - Overdue (past due date)
    - Due this week
    - Due this month
    - Not scheduled
    """
    svc = AssetIntelligenceService(db=db, hotel_id=hotel_id)
    return svc.maintenance_alerts()
