"""
Executive Engine Router — Triangle Black A-014
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.executive_engine.service import ExecutiveEngineService

router = APIRouter(
    prefix="/executive-engine",
    tags=["Executive Engine"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/daily-briefing", summary="GM Daily Operational Briefing")
def get_daily_briefing(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return ExecutiveEngineService(db=db, hotel_id=hotel_id).daily_briefing()

@router.get("/health-score", summary="Operational Health Score 0-100")
def get_health_score(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return ExecutiveEngineService(db=db, hotel_id=hotel_id).health_score()

@router.get("/alerts", summary="Priority Alert Board")
def get_alerts(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = ExecutiveEngineService(db=db, hotel_id=hotel_id)
    alerts = svc.alerts()
    critical = [a for a in alerts if a["severity"] in ("P0_CRITICAL", "P1_HIGH")]
    return {
        "hotel_id": hotel_id,
        "total_alerts": len(alerts),
        "critical_count": len(critical),
        "requires_immediate_action": len(critical) > 0,
        "alerts": alerts,
    }
