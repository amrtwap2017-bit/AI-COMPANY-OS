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


@router.get("/mttr", summary="MTTR by Priority")
def get_mttr_by_priority(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Mean Time To Repair broken down by priority level.
    Emergency target: 4h | Critical: 8h | High: 24h | Medium: 72h | Low: 168h
    Data quality guard: excludes records where completed_at <= created_at.
    """
    svc = TrendEngineService(db=db, hotel_id=hotel_id)
    return svc.mttr_by_priority()


@router.get("/proactive-ratio", summary="Proactive vs Reactive Maintenance Ratio")
def get_proactive_ratio(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Percentage of proactive vs reactive work orders.
    Industry target: 70% proactive, 30% reactive.
    Proactive: preventive, inspection, planned, scheduled.
    Reactive: corrective, emergency, breakdown, unplanned.
    """
    svc = TrendEngineService(db=db, hotel_id=hotel_id)
    return svc.proactive_vs_reactive()


@router.get("/repeat-failures", summary="Assets With Repeat Failures")
def get_repeat_failures(
    threshold: int = 3,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Assets flagged for repeat failures in last 90 days.
    threshold: minimum number of WOs to flag (default 3).
    Returns: asset list sorted by WO count, with risk level.
    """
    svc = TrendEngineService(db=db, hotel_id=hotel_id)
    return svc.repeat_failure_rate(threshold=threshold)


@router.get("/monthly-direction", summary="Monthly KPI Trend Direction")
def get_monthly_direction(
    months: int = 4,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Month-over-month trend with direction labels (improving/degrading/stable).
    Returns overall assessment: IMPROVING / DEGRADING / MIXED.
    """
    svc = TrendEngineService(db=db, hotel_id=hotel_id)
    return svc.monthly_trend_with_direction(months=months)

