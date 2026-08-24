"""SLA Compliance & Governance Intelligence Router — Triangle Black Enterprise OS v6.0"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.sla_intelligence.service import SLAIntelligenceService

router = APIRouter(prefix="/sla-intelligence", tags=["SLA Compliance & Governance"])

@router.get("/report")
def get_sla_governance_report(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = SLAIntelligenceService(db=db, hotel_id=hotel_id)
    return service.get_sla_governance_report()

@router.get("/scorecard")
def get_compliance_scorecard(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = SLAIntelligenceService(db=db, hotel_id=hotel_id)
    return service._get_compliance_scorecard()

@router.get("/technician-performance")
def get_technician_performance(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = SLAIntelligenceService(db=db, hotel_id=hotel_id)
    return {"technicians": service._get_technician_performance()}

@router.get("/governance-recommendations")
def get_governance_recommendations(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = SLAIntelligenceService(db=db, hotel_id=hotel_id)
    return {"recommendations": service._get_governance_recommendations()}
