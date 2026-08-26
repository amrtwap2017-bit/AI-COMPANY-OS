"""
PM Engine Router — Triangle Black A-005
Executive-level preventive maintenance analytics.

Does NOT duplicate:
- /maintenance/pm-plans (CRUD via pm_plan_api)
- /maintenance/pm-plans-v2 (CRUD via pm_plan_api)
- /asset-intelligence/alerts (asset-level maintenance alerts)

NEW endpoints:
  GET /api/v1/pm-engine/summary     → Executive PM dashboard
  GET /api/v1/pm-engine/compliance  → PM compliance % by category
  GET /api/v1/pm-engine/schedule    → 30-day maintenance schedule
  GET /api/v1/pm-engine/overdue     → All overdue items + urgency rank
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.pm_engine.service import PMEngineService

router = APIRouter(
    prefix="/pm-engine",
    tags=["PM Engine"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/summary", summary="Executive PM Dashboard")
def get_pm_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Executive preventive maintenance dashboard.
    Shows: compliance %, schedule coverage, overdue count, insights.
    """
    svc = PMEngineService(db=db, hotel_id=hotel_id)
    return svc.pm_summary()


@router.get("/compliance", summary="PM Compliance by Category")
def get_pm_compliance(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    PM Compliance = Completed / Scheduled × 100, broken down by asset category.
    Uses both maintenance_plans table and assets.next_maintenance_date.
    """
    svc = PMEngineService(db=db, hotel_id=hotel_id)
    return svc.pm_compliance_by_category()


@router.get("/schedule", summary="30-Day Maintenance Schedule")
def get_maintenance_schedule(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Maintenance schedule for next 30 days.
    Includes overdue items (negative days_until_due).
    Status: OVERDUE / DUE_TODAY / DUE_THIS_WEEK / DUE_THIS_MONTH / SCHEDULED
    """
    svc = PMEngineService(db=db, hotel_id=hotel_id)
    return svc.maintenance_schedule_30d()


@router.get("/overdue", summary="All Overdue Maintenance")
def get_overdue_maintenance(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    All overdue maintenance items ranked by urgency.
    Priority: critical assets first, then by days overdue.
    """
    svc = PMEngineService(db=db, hotel_id=hotel_id)
    return svc.overdue_maintenance()
