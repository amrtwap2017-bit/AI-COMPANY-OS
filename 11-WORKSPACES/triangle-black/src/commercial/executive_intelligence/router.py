"""
Executive Intelligence Router — Triangle Black Enterprise OS v6.0
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.executive_intelligence.service import ExecutiveIntelligenceService

router = APIRouter(prefix="/executive-intelligence", tags=["Executive Intelligence"])


@router.get("/briefing")
def get_executive_briefing(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Full C-suite executive briefing — financial, risk, SLA, supplier, AI actions."""
    service = ExecutiveIntelligenceService(db=db, hotel_id=hotel_id)
    return service.get_executive_briefing()


@router.get("/top-risks")
def get_top_risks(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = ExecutiveIntelligenceService(db=db, hotel_id=hotel_id)
    return {"risks": service._top_risks()}


@router.get("/recommended-actions")
def get_recommended_actions(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = ExecutiveIntelligenceService(db=db, hotel_id=hotel_id)
    return {"actions": service._recommended_actions()}


@router.get("/portfolio-health")
def get_portfolio_health(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = ExecutiveIntelligenceService(db=db, hotel_id=hotel_id)
    return service._portfolio_health_index()


@router.get("/summary")
def get_executive_summary_alias(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Returns KPI read model summary — hotel_id, operations, maintenance, procurement, financial."""
    from src.commercial.executive_intelligence.read_models import ExecutiveKPIReadModel
    rm = ExecutiveKPIReadModel(db=db, hotel_id=hotel_id)
    return rm.get_full_summary()


# ── Executive KPI Read Model Endpoints (T-007) ───────────────────────────────
from src.commercial.executive_intelligence.read_models import ExecutiveKPIReadModel

@router.get("/summary")
def get_executive_summary(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Full executive KPI summary — hotel_id, operations, maintenance, procurement, financial."""
    rm = ExecutiveKPIReadModel(db=db, hotel_id=hotel_id)
    return rm.get_full_summary()

@router.get("/operations")
def get_operations_kpi(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Operations KPI read model — work orders, assets, SLA compliance."""
    rm = ExecutiveKPIReadModel(db=db, hotel_id=hotel_id)
    return rm.get_operations_kpi()

@router.get("/maintenance")
def get_maintenance_kpi(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Maintenance KPI read model — PM compliance, MTTR, critical assets."""
    rm = ExecutiveKPIReadModel(db=db, hotel_id=hotel_id)
    return rm.get_maintenance_kpi()

@router.get("/procurement")
def get_procurement_kpi(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Procurement KPI read model — suppliers, POs, spend efficiency."""
    rm = ExecutiveKPIReadModel(db=db, hotel_id=hotel_id)
    return rm.get_procurement_kpi()

@router.get("/financial")
def get_financial_kpi(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Financial KPI read model — spend, payments, budget variance."""
    rm = ExecutiveKPIReadModel(db=db, hotel_id=hotel_id)
    return rm.get_financial_kpi()
