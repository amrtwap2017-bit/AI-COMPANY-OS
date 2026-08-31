"""Energy & Sustainability Intelligence Router — Triangle Black Enterprise OS v6.0"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.energy_intelligence.service import EnergyIntelligenceService

from src.core.auth import get_current_user as _gcu_v7
from fastapi import Depends as _Dep_v7
router = APIRouter(prefix="/energy-intelligence", tags=["Energy & Sustainability Intelligence"], dependencies=[_Dep_v7(_gcu_v7)])

@router.get("/report")
def get_energy_intelligence_report(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = EnergyIntelligenceService(db=db, hotel_id=hotel_id)
    return service.get_energy_intelligence_report()

@router.get("/cost-optimization")
def get_energy_cost_optimization(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = EnergyIntelligenceService(db=db, hotel_id=hotel_id)
    return {"opportunities": service._get_cost_optimization()}

@router.get("/carbon-footprint")
def get_carbon_footprint(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = EnergyIntelligenceService(db=db, hotel_id=hotel_id)
    return service._get_carbon_footprint()

@router.get("/alerts")
def get_energy_risk_alerts(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = EnergyIntelligenceService(db=db, hotel_id=hotel_id)
    return {"alerts": service._get_energy_risk_alerts()}
