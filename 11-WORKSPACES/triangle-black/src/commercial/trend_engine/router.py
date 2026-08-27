"""Trend Engine Router — A-070"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.trend_engine.service import TrendEngineService

router = APIRouter(
    prefix="/trend-engine",
    tags=["Trend Engine"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/summary", summary="Platform Trend Summary")
def get_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return TrendEngineService(db=db, hotel_id=hotel_id).summary()

@router.get("/monthly", summary="Monthly KPI Trend")
def get_monthly(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    months: int = Query(default=6, le=12),
):
    svc = TrendEngineService(db=db, hotel_id=hotel_id)
    data = svc.monthly_kpis(months=months)
    return {"hotel_id": hotel_id, "months": len(data), "data": data}

@router.get("/compare", summary="Current vs Previous Month")
def compare_months(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return TrendEngineService(db=db, hotel_id=hotel_id).compare_months()

@router.get("/spend", summary="Procurement Spend Trend")
def get_spend_trend(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = TrendEngineService(db=db, hotel_id=hotel_id)
    data = svc.spend_trend(months=6)
    return {"hotel_id": hotel_id, "months": len(data), "data": data}
