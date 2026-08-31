"""Financial Leakage Detection & Cost Intelligence Router — Triangle Black Enterprise OS v6.0"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.financial_intelligence.service import FinancialIntelligenceService

from src.core.auth import get_current_user as _gcu_v7
from fastapi import Depends as _Dep_v7
router = APIRouter(prefix="/financial-intelligence", tags=["Financial Intelligence"], dependencies=[_Dep_v7(_gcu_v7)])

@router.get("/report")
def get_financial_intelligence_report(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = FinancialIntelligenceService(db=db, hotel_id=hotel_id)
    return service.get_financial_intelligence_report()

@router.get("/leakage")
def get_leakage_detection(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = FinancialIntelligenceService(db=db, hotel_id=hotel_id)
    return service._get_leakage_detection()

@router.get("/cost-reduction")
def get_cost_reduction_opportunities(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = FinancialIntelligenceService(db=db, hotel_id=hotel_id)
    return {"opportunities": service._get_cost_reduction_opportunities()}

@router.get("/risk-register")
def get_financial_risk_register(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = FinancialIntelligenceService(db=db, hotel_id=hotel_id)
    return {"risks": service._get_financial_risk_register()}
