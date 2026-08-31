"""Demo Environment Router — Triangle Black Enterprise OS v6.0"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.demo_environment.service import DemoEnvironmentService

from src.core.auth import get_current_user as _gcu_v7
from fastapi import Depends as _Dep_v7
router = APIRouter(prefix="/demo", tags=["Customer Demo Environment"], dependencies=[_Dep_v7(_gcu_v7)])

@router.get("/walkthrough")
def get_demo_walkthrough(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = DemoEnvironmentService(db=db, hotel_id=hotel_id)
    return service.get_demo_walkthrough()

@router.get("/live-kpis")
def get_demo_live_kpis(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = DemoEnvironmentService(db=db, hotel_id=hotel_id)
    return service._get_live_kpis()

@router.get("/roi-summary")
def get_demo_roi_summary(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = DemoEnvironmentService(db=db, hotel_id=hotel_id)
    return service._get_roi_summary()
