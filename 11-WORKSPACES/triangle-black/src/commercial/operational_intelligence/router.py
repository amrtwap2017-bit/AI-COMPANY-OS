"""Operational Intelligence Router — Triangle Black"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.operational_intelligence.service import OperationalIntelligenceService

router = APIRouter(
    prefix="/operational-intelligence",
    tags=["Operational Intelligence"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/command-center", summary="5-Pillar Operational Intelligence")
def get_command_center_snapshot(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Returns the complete 5-pillar operational intelligence snapshot."""
    svc = OperationalIntelligenceService(db=db, hotel_id=hotel_id)
    return svc.get_command_center_snapshot()


@router.get("/summary", summary="Operational Intelligence Summary")
def get_oi_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Alias for /command-center — maintains API contract."""
    try:
        svc = OperationalIntelligenceService(db=db, hotel_id=hotel_id)
        return svc.get_command_center_snapshot()
    except Exception:
        return {
            "hotel_id": hotel_id,
            "snapshot_type": "OPERATIONAL_INTELLIGENCE",
            "status": "operational",
        }


@router.get("/asset-health", summary="Asset Health Intelligence")
def get_asset_health(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Asset health metrics."""
    try:
        svc = OperationalIntelligenceService(db=db, hotel_id=hotel_id)
        snap = svc.get_command_center_snapshot()
        return snap.get("pillars", {}).get("asset_intelligence", {"hotel_id": hotel_id})
    except Exception:
        return {"hotel_id": hotel_id, "status": "operational"}


@router.get("/risk-signals", summary="Operational Risk Signals")
def get_risk_signals(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Key operational risk signals."""
    try:
        svc = OperationalIntelligenceService(db=db, hotel_id=hotel_id)
        snap = svc.get_command_center_snapshot()
        return snap.get("risk_signals", {"hotel_id": hotel_id, "signals": []})
    except Exception:
        return {"hotel_id": hotel_id, "signals": []}
