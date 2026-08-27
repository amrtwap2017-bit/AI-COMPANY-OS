"""Predictive Maintenance Engine Router — A-071"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.predictive_engine.service import PredictiveEngineService

router = APIRouter(
    prefix="/predictive-engine",
    tags=["Predictive Engine"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/summary", summary="Predictive Maintenance Summary")
def get_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return PredictiveEngineService(db=db, hotel_id=hotel_id).summary()

@router.get("/assets", summary="Per-Asset Predictive Risk Scores")
def get_asset_predictions(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    limit: int = Query(default=30, le=100),
):
    svc = PredictiveEngineService(db=db, hotel_id=hotel_id)
    assets = svc.asset_risk_predictions(limit=limit)
    immediate = len([a for a in assets if a["recommendation"] == "IMMEDIATE_ACTION"])
    return {
        "hotel_id": hotel_id,
        "count": len(assets),
        "immediate_action_count": immediate,
        "assets": assets,
    }
