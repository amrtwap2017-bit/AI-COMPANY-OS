"""
WO Backlog Intelligence Engine Router — Triangle Black A-035
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.backlog_engine.service import BacklogEngineService

router = APIRouter(
    prefix="/backlog-engine",
    tags=["Backlog Engine"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/summary", summary="WO Backlog Intelligence Summary")
def get_backlog_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return BacklogEngineService(db=db, hotel_id=hotel_id).summary()

@router.get("/by-priority", summary="Backlog Age by Priority")
def get_backlog_by_priority(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = BacklogEngineService(db=db, hotel_id=hotel_id)
    data = svc.by_priority()
    return {"hotel_id": hotel_id, "count": len(data), "by_priority": data}

@router.get("/oldest", summary="Oldest Open Work Orders")
def get_oldest_wos(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    limit: int = Query(default=20, le=100),
):
    svc = BacklogEngineService(db=db, hotel_id=hotel_id)
    oldest = svc.oldest(limit=limit)
    critical = [w for w in oldest if w["urgency"] in ("CRITICAL","HIGH")]
    return {
        "hotel_id": hotel_id,
        "total": len(oldest),
        "critical_count": len(critical),
        "work_orders": oldest,
    }
