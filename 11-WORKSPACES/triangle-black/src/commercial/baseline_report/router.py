"""
Baseline Report Router — Triangle Black A-010-B
GET /api/v1/baseline/report  — full operational snapshot
GET /api/v1/baseline/risk    — risk score only (lightweight)
GET /api/v1/baseline/insights — key insight sentences only
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.baseline_report.service import BaselineReportService

router = APIRouter(
    prefix="/baseline",
    tags=["Operational Baseline"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/report", summary="Full Operational Baseline Report")
def get_baseline_report(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Returns the complete operational baseline report for a hotel tenant.
    This is the first report a new customer should see after data import.
    Sections: asset health, work orders, costs, procurement,
    service requests, contracts, sites, workforce, risk score, insights.
    """
    svc = BaselineReportService(db=db, hotel_id=hotel_id)
    return svc.generate()


@router.get("/risk", summary="Operational Risk Score")
def get_risk_score(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Lightweight risk score endpoint — suitable for dashboard widgets."""
    svc = BaselineReportService(db=db, hotel_id=hotel_id)
    assets = svc.asset_health()
    work_orders = svc.work_order_backlog()
    return svc.operational_risk_score(assets, work_orders)


@router.get("/insights", summary="Auto-generated Operational Insights")
def get_insights(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Returns 5 auto-generated insight sentences from operational data."""
    svc = BaselineReportService(db=db, hotel_id=hotel_id)
    assets = svc.asset_health()
    work_orders = svc.work_order_backlog()
    costs = svc.maintenance_cost()
    procurement = svc.procurement_summary()
    return {
        "hotel_id": hotel_id,
        "insights": svc.generate_insights(assets, work_orders, costs, procurement)
    }
