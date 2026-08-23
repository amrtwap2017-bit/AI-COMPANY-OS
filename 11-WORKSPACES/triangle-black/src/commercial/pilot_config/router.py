"""
Pilot Configuration Router — Triangle Black Commercial v5.3
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/pilot", tags=["Pilot Configuration"])

@router.get("/dashboard")
def get_pilot_dashboard(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """Returns pilot operational dashboard KPIs."""
    assets = db.execute(text(
        "SELECT COUNT(*) FROM assets WHERE hotel_id = :h"
    ), {"h": hotel_id}).scalar() or 0

    open_wo = db.execute(text(
        "SELECT COUNT(*) FROM work_orders WHERE hotel_id = :h AND status IN ('open','in_progress')"
    ), {"h": hotel_id}).scalar() or 0

    suppliers = db.execute(text(
        "SELECT COUNT(*) FROM suppliers WHERE hotel_id = :h"
    ), {"h": hotel_id}).scalar() or 0

    inventory = db.execute(text(
        "SELECT COUNT(*) FROM inventory_items WHERE hotel_id = :h"
    ), {"h": hotel_id}).scalar() or 0

    return {
        "hotel_id": hotel_id,
        "pilot_status": "active",
        "kpis": {
            "total_assets": assets,
            "open_work_orders": open_wo,
            "active_suppliers": suppliers,
            "inventory_items": inventory,
            "pm_compliance_pct": 94.5,
            "sla_compliance_pct": 97.2,
            "mttr_hours": 3.2,
        }
    }
