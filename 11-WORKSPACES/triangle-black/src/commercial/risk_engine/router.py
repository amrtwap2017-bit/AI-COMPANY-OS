"""
Operational Risk Engine Router — Triangle Black A-012
Composite risk intelligence across all domains.

NEW:
  GET /api/v1/risk-engine/summary    → Overall risk + all domains
  GET /api/v1/risk-engine/assets     → Asset risk domain
  GET /api/v1/risk-engine/operations → Operations risk domain
  GET /api/v1/risk-engine/maintenance → Maintenance risk domain
  GET /api/v1/risk-engine/finance    → Finance risk domain
  GET /api/v1/risk-engine/procurement → Procurement risk domain
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.risk_engine.service import RiskEngineService

router = APIRouter(
    prefix="/risk-engine",
    tags=["Risk Engine"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/summary", summary="Overall Operational Risk")
def get_overall_risk(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db)):
    return RiskEngineService(db=db, hotel_id=hotel_id).overall_risk()

@router.get("/assets", summary="Asset Risk Domain")
def get_asset_risk(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db)):
    return RiskEngineService(db=db, hotel_id=hotel_id).asset_risk()

@router.get("/operations", summary="Operations Risk Domain")
def get_operations_risk(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db)):
    return RiskEngineService(db=db, hotel_id=hotel_id).operations_risk()

@router.get("/maintenance", summary="Maintenance Risk Domain")
def get_maintenance_risk(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db)):
    return RiskEngineService(db=db, hotel_id=hotel_id).maintenance_risk()

@router.get("/finance", summary="Finance Risk Domain")
def get_finance_risk(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db)):
    return RiskEngineService(db=db, hotel_id=hotel_id).finance_risk()

@router.get("/procurement", summary="Procurement Risk Domain")
def get_procurement_risk(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db)):
    return RiskEngineService(db=db, hotel_id=hotel_id).procurement_risk()
