"""
Operational Risk Engine Router — Triangle Black A-021
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.risk_engine.service import RiskEngineService

router = APIRouter(
    prefix="/risk-engine",
    tags=["Risk Engine"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/summary", summary="Composite Operational Risk Summary")
def get_risk_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return RiskEngineService(db=db, hotel_id=hotel_id).summary()

@router.get("/asset-risk", summary="Per-Asset Predictive Risk Scores")
def get_asset_risk(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    limit: int = Query(default=30, le=100),
):
    svc = RiskEngineService(db=db, hotel_id=hotel_id)
    scores = svc.asset_risk_scores(limit=limit)
    critical = [s for s in scores if s["risk_level"] == "CRITICAL"]
    return {
        "hotel_id": hotel_id,
        "count": len(scores),
        "critical_count": len(critical),
        "assets": scores,
    }

@router.get("/operational", summary="Real-Time Operational Risk")
def get_operational_risk(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = RiskEngineService(db=db, hotel_id=hotel_id)
    return svc.operational_risk()

@router.get("/forecast", summary="30-Day Risk Forecast")
def get_risk_forecast(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = RiskEngineService(db=db, hotel_id=hotel_id)
    return svc.forecast()
