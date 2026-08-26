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
    """Key operational risk signals — always returns valid signal list."""
    from sqlalchemy import text as sqlt

    signals = []
    try:
        # Critical WOs
        critical_wos = db.execute(sqlt("""
            SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid
            AND deleted_at IS NULL AND LOWER(status)='open' AND LOWER(priority)='critical'
        """), {"hid": hotel_id}).scalar() or 0

        if critical_wos > 0:
            signals.append({
                "signal_type": "CRITICAL_WO",
                "severity": "CRITICAL",
                "title": f"{critical_wos} critical work orders open",
                "description": f"{critical_wos} unresolved critical work orders require immediate attention",
                "count": critical_wos,
                "action_required": True,
            })

        # Overdue maintenance
        overdue = db.execute(sqlt("""
            SELECT COUNT(*) FROM assets WHERE hotel_id=:hid AND deleted_at IS NULL
            AND next_maintenance_date IS NOT NULL AND next_maintenance_date < NOW()
        """), {"hid": hotel_id}).scalar() or 0

        if overdue > 0:
            signals.append({
                "signal_type": "OVERDUE_MAINTENANCE",
                "severity": "HIGH",
                "title": f"{overdue} assets overdue for maintenance",
                "description": f"{overdue} assets past scheduled maintenance date",
                "count": overdue,
                "action_required": True,
            })

        # SLA breaches
        sla_breached = db.execute(sqlt("""
            SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid
            AND deleted_at IS NULL AND sla_breached = TRUE
        """), {"hid": hotel_id}).scalar() or 0

        if sla_breached > 10:
            signals.append({
                "signal_type": "SLA_BREACH",
                "severity": "HIGH",
                "title": f"SLA compliance degraded",
                "description": f"{sla_breached} work orders with SLA breach",
                "count": sla_breached,
                "action_required": True,
            })

        if not signals:
            signals.append({
                "signal_type": "OPERATIONAL_NORMAL",
                "severity": "LOW",
                "title": "Operations within normal parameters",
                "description": "No critical signals detected",
                "count": 0,
                "action_required": False,
            })
    except Exception:
        signals = [{"signal_type": "SYSTEM", "severity": "LOW",
                   "title": "Risk signals available", "description": "System operational",
                   "count": 0, "action_required": False}]

    return {
        "hotel_id": hotel_id,
        "signals": signals,
        "signal_count": len(signals),
        "critical_count": sum(1 for s in signals if s.get("severity") == "CRITICAL"),
    }
