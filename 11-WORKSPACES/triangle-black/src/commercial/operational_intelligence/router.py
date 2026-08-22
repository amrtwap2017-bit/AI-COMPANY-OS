"""
Operational Intelligence Router — Triangle Black Commercial Product
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.operational_intelligence.service import OperationalIntelligenceService

router = APIRouter(prefix="/intelligence", tags=["Operational Intelligence"])

@router.get("/summary")
def get_operational_intelligence_summary(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Returns the complete 5-pillar Operational Intelligence commercial package."""
    service = OperationalIntelligenceService(db=db, hotel_id=hotel_id)
    return service.get_commercial_overview()
