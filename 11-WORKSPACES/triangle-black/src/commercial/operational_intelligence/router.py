"""
Operational Intelligence Router — Triangle Black Enterprise OS v6.0
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.operational_intelligence.service import OperationalIntelligenceService

router = APIRouter(prefix="/operational-intelligence", tags=["Operational Intelligence"])


@router.get("/command-center")
def get_command_center_snapshot(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Returns the complete 5-pillar operational intelligence snapshot for the property."""
    service = OperationalIntelligenceService(db=db, hotel_id=hotel_id)
    return service.get_command_center_snapshot()


@router.get("/asset-health")
def get_asset_health(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = OperationalIntelligenceService(db=db, hotel_id=hotel_id)
    return service._get_asset_health()


@router.get("/risk-signals")
def get_risk_signals(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = OperationalIntelligenceService(db=db, hotel_id=hotel_id)
    return {"signals": service._get_risk_signals()}


@router.get("/summary", summary="Operational Intelligence Summary (alias)")
def get_oi_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Alias for /command-center — maintains API contract."""
    return get_command_center(hotel_id=hotel_id, db=db)
