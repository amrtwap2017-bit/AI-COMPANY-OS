"""
Cost Intelligence Engine Router — Triangle Black A-019
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.cost_engine.service import CostEngineService

router = APIRouter(
    prefix="/cost-engine",
    tags=["Cost Engine"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/summary", summary="Cost Intelligence Summary")
def get_cost_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return CostEngineService(db=db, hotel_id=hotel_id).summary()

@router.get("/by-asset", summary="Maintenance Cost Per Asset")
def get_cost_by_asset(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    limit: int = Query(default=30, le=100),
):
    svc = CostEngineService(db=db, hotel_id=hotel_id)
    data = svc.cost_by_asset(limit=limit)
    total = sum(a["total_invoice_cost"] for a in data)
    return {
        "hotel_id": hotel_id,
        "count": len(data),
        "total_cost": round(total, 2),
        "assets": data,
    }

@router.get("/by-category", summary="Maintenance Cost by Asset Category")
def get_cost_by_category(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = CostEngineService(db=db, hotel_id=hotel_id)
    cats = svc.cost_by_category()
    return {"hotel_id": hotel_id, "count": len(cats), "categories": cats}

@router.get("/recurring", summary="Recurring Failure Assets — Cost Amplifiers")
def get_recurring_failures(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = CostEngineService(db=db, hotel_id=hotel_id)
    recurring = svc.recurring_failures()
    chronic = [r for r in recurring if r["pattern"] == "CHRONIC"]
    return {
        "hotel_id": hotel_id,
        "total_recurring": len(recurring),
        "chronic_count": len(chronic),
        "requires_action": len(chronic) > 0,
        "assets": recurring,
    }
