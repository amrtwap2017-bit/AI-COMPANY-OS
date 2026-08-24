"""
Executive Intelligence Router — Triangle Black Enterprise OS v6.0
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.executive_intelligence.service import ExecutiveIntelligenceService

router = APIRouter(prefix="/executive-intelligence", tags=["Executive Intelligence"])


@router.get("/briefing")
def get_executive_briefing(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Full C-suite executive briefing — financial, risk, SLA, supplier, AI actions."""
    service = ExecutiveIntelligenceService(db=db, hotel_id=hotel_id)
    return service.get_executive_briefing()


@router.get("/top-risks")
def get_top_risks(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = ExecutiveIntelligenceService(db=db, hotel_id=hotel_id)
    return {"risks": service._top_risks()}


@router.get("/recommended-actions")
def get_recommended_actions(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = ExecutiveIntelligenceService(db=db, hotel_id=hotel_id)
    return {"actions": service._recommended_actions()}


@router.get("/portfolio-health")
def get_portfolio_health(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = ExecutiveIntelligenceService(db=db, hotel_id=hotel_id)
    return service._portfolio_health_index()


@router.get("/summary")
def get_executive_summary_alias(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Alias for /briefing — backward compatibility with demo tenant tests."""
    service = ExecutiveIntelligenceService(db=db, hotel_id=hotel_id)
    return service.get_executive_briefing()
