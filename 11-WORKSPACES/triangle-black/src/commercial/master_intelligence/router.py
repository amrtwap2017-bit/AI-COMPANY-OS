"""Master Intelligence Aggregator Router — Triangle Black Enterprise OS v6.0"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.master_intelligence.service import MasterIntelligenceService

router = APIRouter(prefix="/intelligence", tags=["Master Intelligence Aggregator"])

@router.get("/snapshot")
def get_full_intelligence_snapshot(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """
    Master API — single call returns complete 8-pillar operational intelligence.
    Powers executive dashboards, board presentations, and pilot demonstrations.
    """
    service = MasterIntelligenceService(db=db, hotel_id=hotel_id)
    return service.get_full_intelligence_snapshot()
