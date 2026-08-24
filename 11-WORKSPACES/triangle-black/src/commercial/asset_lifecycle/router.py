"""Asset Lifecycle Intelligence Router — Triangle Black Enterprise OS v6.0"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.asset_lifecycle.service import AssetLifecycleService

router = APIRouter(prefix="/asset-lifecycle", tags=["Asset Lifecycle Intelligence"])

@router.get("/report")
def get_lifecycle_intelligence_report(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = AssetLifecycleService(db=db, hotel_id=hotel_id)
    return service.get_lifecycle_intelligence_report()

@router.get("/replacement-economics")
def get_replacement_economics(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = AssetLifecycleService(db=db, hotel_id=hotel_id)
    return {"economics": service._get_replacement_economics()}

@router.get("/pm-effectiveness")
def get_pm_effectiveness(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = AssetLifecycleService(db=db, hotel_id=hotel_id)
    return service._get_pm_effectiveness()

@router.get("/risk-register")
def get_lifecycle_risk_register(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = AssetLifecycleService(db=db, hotel_id=hotel_id)
    return {"risks": service._get_lifecycle_risk_register()}
