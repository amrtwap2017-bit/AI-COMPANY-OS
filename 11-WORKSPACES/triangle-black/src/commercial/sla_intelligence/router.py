"""
SLA Intelligence Router — Triangle Black A-011
NEW SLA analysis endpoints.

Does NOT duplicate:
- /api/v1/baseline/report
- /api/v1/kpi-engine/dashboard

NEW:
  GET /api/v1/sla-intelligence/summary
  GET /api/v1/sla-intelligence/by-priority
  GET /api/v1/sla-intelligence/by-category
  GET /api/v1/sla-intelligence/backlog
  GET /api/v1/sla-intelligence/recommendations
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.sla_intelligence.service import SLAIntelligenceService

router = APIRouter(
    prefix="/sla-intelligence",
    tags=["SLA Intelligence"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/summary", summary="SLA Intelligence Summary")
def get_sla_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = SLAIntelligenceService(db=db, hotel_id=hotel_id)
    return svc.summary()


@router.get("/by-priority", summary="SLA Breach by Priority")
def get_breach_by_priority(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = SLAIntelligenceService(db=db, hotel_id=hotel_id)
    rows = svc.breach_by_priority()
    return {"hotel_id": hotel_id, "count": len(rows), "data": rows}


@router.get("/by-category", summary="SLA Breach by Category")
def get_breach_by_category(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = SLAIntelligenceService(db=db, hotel_id=hotel_id)
    rows = svc.breach_by_category()
    return {"hotel_id": hotel_id, "count": len(rows), "data": rows}


@router.get("/backlog", summary="Work Order Backlog Analysis")
def get_backlog(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = SLAIntelligenceService(db=db, hotel_id=hotel_id)
    return svc.backlog_analysis()


@router.get("/recommendations", summary="SLA Improvement Recommendations")
def get_recommendations(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = SLAIntelligenceService(db=db, hotel_id=hotel_id)
    recs = svc.recommendations()
    return {
        "hotel_id": hotel_id,
        "count": len(recs),
        "recommendations": recs
    }
