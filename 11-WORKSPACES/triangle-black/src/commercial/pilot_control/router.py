"""
Multi-Tenant SRE Pilot Control Router — Triangle Black SaaS v5.5
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_manager
from src.commercial.pilot_control.service import PilotControlService

router = APIRouter(prefix="/pilot-control", tags=["SRE Pilot Control Room"])

@router.get("/status")
def get_consolidated_pilot_status(
    db: Session = Depends(get_db),
    current_user = Depends(require_manager)
):
    """Admin-only endpoint providing consolidated operational status across all pilot tenants."""
    service = PilotControlService(db=db)
    return {"pilots": service.get_all_pilots_status()}
