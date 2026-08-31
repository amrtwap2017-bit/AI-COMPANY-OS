"""
KPI Engine Router — Triangle Black A-007
Unified dashboard with 10 KPIs + Operational Health Index.

Does NOT duplicate:
- /api/v1/baseline/report (8 sections)
- /api/v1/asset-intelligence/summary
- /api/v1/pm-engine/summary
- /api/v1/supplier-engine/summary
- /api/v1/executive-intelligence/briefing

NEW unified dashboard:
  GET /api/v1/kpi-engine/dashboard  → 10 KPIs + OHI + alerts (morning brief)
  GET /api/v1/kpi-engine/ohi        → Operational Health Index only
  GET /api/v1/kpi-engine/alerts     → Red KPIs needing immediate attention
  GET /api/v1/kpi-engine/trends     → 7-day trend data
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.kpi_engine.service import KPIEngineService

router = APIRouter(
    prefix="/kpi-engine",
    tags=["KPI Engine"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/dashboard", summary="10-KPI Morning Dashboard")
def get_kpi_dashboard(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Single-call morning executive dashboard.
    Returns: Operational Health Index, 10 KPIs with RAG status,
    urgent alerts, category breakdown, morning brief sentence.
    """
    svc = KPIEngineService(db=db, hotel_id=hotel_id)
    return svc.dashboard()


@router.get("/ohi", summary="Operational Health Index Only")
def get_ohi(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Lightweight OHI score for dashboard widgets."""
    svc = KPIEngineService(db=db, hotel_id=hotel_id)
    kpis = svc.compute_10_kpis()
    ohi = svc.operational_health_index(kpis)
    return {"hotel_id": hotel_id, "ohi": ohi}


@router.get("/alerts", summary="Red KPIs Needing Immediate Attention")
def get_kpi_alerts(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """KPIs in RED status — requires executive action today."""
    svc = KPIEngineService(db=db, hotel_id=hotel_id)
    kpis = svc.compute_10_kpis()
    alerts = svc.alerts(kpis)
    return {
        "hotel_id": hotel_id,
        "alert_count": len(alerts),
        "alerts": alerts
    }


@router.get("/trends", summary="7-Day KPI Trend Data")
def get_kpi_trends(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Work order and asset trends over the last 7 days."""
    svc = KPIEngineService(db=db, hotel_id=hotel_id)
    return svc.trends()


@router.get("/registry", summary="KPI Registry — all formulas and governance rules")
def get_kpi_registry():
    """
    V7-005: Complete KPI registry.
    Returns every KPI with: formula, source tables, confidence rules,
    thresholds, target, and owner.
    No authentication required — this is public metadata.
    """
    from src.commercial.kpi_engine.registry import get_registry
    return get_registry()

