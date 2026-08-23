"""
Enterprise Production Gate Router — Triangle Black SaaS v6.0
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import require_manager
from src.commercial.production_gate.service import ProductionGateService

router = APIRouter(prefix="/production-gate", tags=["Enterprise Production Gate"])


@router.get("/readiness")
def run_production_readiness_endpoint(
    db: Session = Depends(get_db),
    current_user=Depends(require_manager)
):
    """Runs all 10 production gate checks and returns enterprise readiness certification."""
    service = ProductionGateService(db=db, hotel_id="tb-default-hotel-000000000001")
    return service.run_production_readiness_check()


@router.get("/pilot-summary")
def get_pilot_operational_summary_endpoint(
    db: Session = Depends(get_db),
    current_user=Depends(require_manager)
):
    """Returns operational status for all 3 active commercial pilot tenants."""
    service = ProductionGateService(db=db, hotel_id="tb-default-hotel-000000000001")
    return {"pilots": service.get_pilot_operational_summary()}
