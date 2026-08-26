"""
Cost Intelligence Router — Triangle Black A-010
NEW cost analytics endpoints.

Does NOT duplicate:
- /api/v1/baseline/report
- /api/v1/financial/gl/*

NEW:
  GET /api/v1/cost-intelligence/summary        → Executive cost overview
  GET /api/v1/cost-intelligence/monthly-trend  → 6-month spend trend
  GET /api/v1/cost-intelligence/invoice-aging  → Overdue/aging analysis
  GET /api/v1/cost-intelligence/top-drivers    → Top cost drivers
  GET /api/v1/cost-intelligence/efficiency     → Cost efficiency score
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.cost_intelligence.service import CostIntelligenceService

router = APIRouter(
    prefix="/cost-intelligence",
    tags=["Cost Intelligence"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/summary", summary="Executive Cost Intelligence Summary")
def get_cost_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = CostIntelligenceService(db=db, hotel_id=hotel_id)
    return svc.summary()


@router.get("/monthly-trend", summary="6-Month Spend Trend")
def get_monthly_trend(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = CostIntelligenceService(db=db, hotel_id=hotel_id)
    return svc.monthly_spend_trend()


@router.get("/invoice-aging", summary="Invoice Aging Analysis")
def get_invoice_aging(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = CostIntelligenceService(db=db, hotel_id=hotel_id)
    return svc.invoice_aging()


@router.get("/top-drivers", summary="Top Cost Drivers")
def get_top_drivers(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    limit: int = Query(default=10, le=50),
):
    svc = CostIntelligenceService(db=db, hotel_id=hotel_id)
    return svc.top_cost_drivers(limit=limit)


@router.get("/efficiency", summary="Cost Efficiency Score")
def get_cost_efficiency(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = CostIntelligenceService(db=db, hotel_id=hotel_id)
    return svc.cost_efficiency_score()
