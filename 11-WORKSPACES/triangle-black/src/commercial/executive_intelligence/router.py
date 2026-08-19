"""
T-007: Executive Intelligence Router
Uses read models — no direct OLTP queries.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.executive_intelligence.read_models import ExecutiveKPIReadModel

router = APIRouter(prefix="/executive-intelligence", tags=["Executive Intelligence"])


@router.get("/summary")
def get_executive_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """Full executive KPI summary — operations + maintenance + procurement + financial."""
    model = ExecutiveKPIReadModel(db, hotel_id)
    return model.get_full_summary()


@router.get("/operations")
def get_operations_kpi(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """Operations KPIs — work orders, SLA, priorities."""
    return ExecutiveKPIReadModel(db, hotel_id).get_operations_kpi()


@router.get("/maintenance")
def get_maintenance_kpi(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """Maintenance KPIs — assets, PM compliance, reliability."""
    return ExecutiveKPIReadModel(db, hotel_id).get_maintenance_kpi()


@router.get("/procurement")
def get_procurement_kpi(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """Procurement KPIs — PO status, spend, supplier performance."""
    return ExecutiveKPIReadModel(db, hotel_id).get_procurement_kpi()


@router.get("/financial")
def get_financial_kpi(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """Financial KPIs — invoices, AR/AP, collections."""
    return ExecutiveKPIReadModel(db, hotel_id).get_financial_kpi()
