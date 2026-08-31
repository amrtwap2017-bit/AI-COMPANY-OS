"""Unified Operational Risk Intelligence Router — Triangle Black Enterprise OS v6.0"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.risk_intelligence.service import RiskIntelligenceService

from src.core.auth import get_current_user as _gcu_v7
from fastapi import Depends as _Dep_v7
router = APIRouter(prefix="/risk-intelligence", tags=["Operational Risk Intelligence"], dependencies=[_Dep_v7(_gcu_v7)])

@router.get("/report")
def get_unified_risk_report(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = RiskIntelligenceService(db=db, hotel_id=hotel_id)
    return service.get_unified_risk_report()

@router.get("/composite-score")
def get_composite_risk_score(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = RiskIntelligenceService(db=db, hotel_id=hotel_id)
    risks = service._collect_all_risks()
    return service._calculate_composite_risk_score(risks)

@router.get("/priority-actions")
def get_priority_actions(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = RiskIntelligenceService(db=db, hotel_id=hotel_id)
    risks = service._collect_all_risks()
    return {"actions": service._get_priority_actions(risks)}

@router.get("/domain-scores")
def get_domain_risk_scores(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = RiskIntelligenceService(db=db, hotel_id=hotel_id)
    return service._get_domain_risk_scores()
