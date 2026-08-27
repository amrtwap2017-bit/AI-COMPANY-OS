"""
Technician Productivity Engine Router — Triangle Black A-069
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.technician_engine.service import TechnicianEngineService

router = APIRouter(
    prefix="/technician-engine",
    tags=["Technician Engine"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/summary", summary="Team Productivity Summary")
def get_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return TechnicianEngineService(db=db, hotel_id=hotel_id).summary()

@router.get("/scores", summary="Per-Technician Productivity Scores")
def get_scores(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    limit: int = Query(default=20, le=50),
):
    svc = TechnicianEngineService(db=db, hotel_id=hotel_id)
    scores = svc.productivity_scores(limit=limit)
    return {
        "hotel_id": hotel_id,
        "count": len(scores),
        "technicians": scores,
    }
