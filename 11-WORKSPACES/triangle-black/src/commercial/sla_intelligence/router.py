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


@router.get("/scorecard", summary="SLA Scorecard — Compliance Summary")
def get_sla_scorecard(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """SLA scorecard with compliance %, breach count, grade."""
    svc = SLAIntelligenceService(db=db, hotel_id=hotel_id)
    summary = svc.summary()
    return {
        "hotel_id": hotel_id,
        "overall_compliance_pct": summary["overall_compliance_pct"],
        "overall_breach_pct": summary["overall_breach_pct"],
        "compliance_grade": summary["compliance_grade"],
        "total_work_orders": summary["total_work_orders"],
        "total_breached": summary["total_breached"],
        "by_priority": summary["by_priority"],
    }


@router.get("/governance", summary="SLA Governance Report")
def get_sla_governance(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """SLA governance — breach analysis, recommendations, compliance grade."""
    svc = SLAIntelligenceService(db=db, hotel_id=hotel_id)
    summary = svc.summary()
    return {
        "hotel_id": hotel_id,
        "compliance_grade": summary["compliance_grade"],
        "overall_compliance_pct": summary["overall_compliance_pct"],
        "recommendations": summary["recommendations"],
        "by_category": summary["by_category"],
        "backlog": summary["backlog"],
    }


@router.get("/report", summary="Full SLA Intelligence Report")
def get_sla_report(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Full SLA report — all data combined."""
    svc = SLAIntelligenceService(db=db, hotel_id=hotel_id)
    return svc.summary()


@router.get("/technician-performance", summary="Technician SLA Performance")
def get_technician_performance(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Per-technician SLA completion (uses work_orders.assigned_to if available)."""
    from sqlalchemy import text as sqlt
    from src.core.database import get_db as _get_db
    try:
        rows = db.execute(sqlt("""
            SELECT
                COALESCE(assigned_to, 'unassigned') AS technician,
                COUNT(*) AS total_assigned,
                COUNT(*) FILTER (WHERE sla_breached = TRUE) AS breached,
                COUNT(*) FILTER (WHERE LOWER(status) IN ('completed','closed')) AS completed,
                ROUND(
                    COUNT(*) FILTER (WHERE sla_breached = FALSE OR sla_breached IS NULL)::numeric
                    / NULLIF(COUNT(*),0) * 100, 1
                ) AS compliance_pct
            FROM work_orders
            WHERE hotel_id = :hid AND deleted_at IS NULL
            GROUP BY assigned_to
            ORDER BY breached DESC
            LIMIT 20
        """), {"hid": hotel_id}).fetchall()
        return {
            "hotel_id": hotel_id,
            "technicians": [dict(r._mapping) for r in rows],
            "count": len(rows),
        }
    except Exception:
        return {"hotel_id": hotel_id, "technicians": [], "count": 0}
