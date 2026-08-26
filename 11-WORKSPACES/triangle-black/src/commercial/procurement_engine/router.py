"""
Procurement Intelligence Engine Router — Triangle Black A-016
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.procurement_engine.service import ProcurementEngineService

router = APIRouter(
    prefix="/procurement-engine",
    tags=["Procurement Engine"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/summary", summary="Executive Procurement Intelligence Summary")
def get_procurement_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return ProcurementEngineService(db=db, hotel_id=hotel_id).summary()

@router.get("/spend", summary="Spend Analysis by Supplier")
def get_spend_by_supplier(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    limit: int = Query(default=20, le=100),
):
    svc = ProcurementEngineService(db=db, hotel_id=hotel_id)
    data = svc.spend_by_supplier(limit=limit)
    total = sum(s["total_spend"] for s in data)
    return {
        "hotel_id": hotel_id,
        "count": len(data),
        "total_spend": round(total, 2),
        "suppliers": data
    }

@router.get("/emergency", summary="Emergency and Expedited Purchases")
def get_emergency_purchases(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = ProcurementEngineService(db=db, hotel_id=hotel_id)
    data = svc.emergency_purchases()
    bypass_risk = [p for p in data if p["risk_flag"] == "BYPASS_RISK"]
    return {
        "hotel_id": hotel_id,
        "total": len(data),
        "bypass_risk_count": len(bypass_risk),
        "purchases": data,
    }

@router.get("/pending", summary="Purchase Orders Awaiting Approval")
def get_pending_approvals(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = ProcurementEngineService(db=db, hotel_id=hotel_id)
    pending = svc.pending_approvals()
    overdue = [p for p in pending if p["urgency"] == "OVERDUE"]
    return {
        "hotel_id": hotel_id,
        "total_pending": len(pending),
        "overdue_count": len(overdue),
        "requires_action": len(overdue) > 0,
        "purchase_orders": pending,
    }
