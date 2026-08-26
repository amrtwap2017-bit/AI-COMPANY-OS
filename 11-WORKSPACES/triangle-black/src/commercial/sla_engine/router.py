"""
SLA Engine Router — Triangle Black A-013
NEW endpoints — does NOT duplicate /api/v1/sla-intelligence/*

NEW:
  GET /api/v1/sla-engine/summary      — executive overview
  GET /api/v1/sla-engine/by-priority  — per-priority compliance
  GET /api/v1/sla-engine/trend        — weekly breach trend
  GET /api/v1/sla-engine/at-risk      — open WOs at risk
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.sla_engine.service import SLAEngineService

router = APIRouter(
    prefix="/sla-engine",
    tags=["SLA Engine"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/summary", summary="Executive SLA Summary")
def get_sla_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return SLAEngineService(db=db, hotel_id=hotel_id).summary()


@router.get("/by-priority", summary="SLA Compliance by Priority")
def get_sla_by_priority(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = SLAEngineService(db=db, hotel_id=hotel_id)
    data = svc.by_priority()
    return {"hotel_id": hotel_id, "count": len(data), "by_priority": data}


@router.get("/trend", summary="Weekly SLA Breach Trend")
def get_sla_trend(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    weeks: int = Query(default=8, le=52),
):
    svc = SLAEngineService(db=db, hotel_id=hotel_id)
    trend = svc.weekly_trend(weeks=weeks)
    return {"hotel_id": hotel_id, "weeks": weeks, "trend": trend}


@router.get("/at-risk", summary="Open Work Orders at SLA Risk")
def get_sla_at_risk(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = SLAEngineService(db=db, hotel_id=hotel_id)
    at_risk = svc.at_risk()
    breached = [r for r in at_risk if r["risk_level"] == "BREACHED"]
    critical = [r for r in at_risk if r["risk_level"] == "CRITICAL"]
    return {
        "hotel_id": hotel_id,
        "total_at_risk": len(at_risk),
        "breached_count": len(breached),
        "critical_count": len(critical),
        "work_orders": at_risk,
    }
