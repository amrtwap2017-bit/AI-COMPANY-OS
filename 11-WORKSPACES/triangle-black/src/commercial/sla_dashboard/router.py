from __future__ import annotations
import datetime
from datetime import datetime as _dt
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

from src.core.auth import get_current_user as _gcu_v7
from fastapi import Depends as _Dep_v7
router = APIRouter(prefix="/sla", tags=["sla-dashboard"], dependencies=[_Dep_v7(_gcu_v7)])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _safe_int(v):
    try: return int(v or 0)
    except: return 0

def _safe_float(v):
    try: return float(v or 0)
    except: return 0.0

@router.get("/overview", summary="SLA compliance overview")
def sla_overview(hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """
    Program B — SLA Dashboard.
    Calculates SLA compliance from work_orders data.
    Target: 95% completion within SLA window.
    """
    try:
        row = db.execute(text("""
            SELECT
                count(*) as total,
                sum(CASE WHEN status IN ('completed','closed') THEN 1 ELSE 0 END) as completed,
                sum(CASE WHEN due_date < NOW()
                         AND status NOT IN ('completed','closed','cancelled')
                         THEN 1 ELSE 0 END) as sla_breached,
                sum(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical_total,
                sum(CASE WHEN priority = 'critical'
                         AND status NOT IN ('completed','closed','cancelled')
                         THEN 1 ELSE 0 END) as critical_open,
                sum(CASE WHEN completed_at IS NOT NULL AND started_at IS NOT NULL
                         THEN EXTRACT(EPOCH FROM (completed_at - started_at))/3600
                         ELSE NULL END) as total_hours,
                count(CASE WHEN completed_at IS NOT NULL AND started_at IS NOT NULL
                           THEN 1 END) as resolved_count
            FROM work_orders
        """)).fetchone()
        d = row_to_dict(row)
    except Exception:
        d = {}

    total     = _safe_int(d.get("total"))
    completed = _safe_int(d.get("completed"))
    breached  = _safe_int(d.get("sla_breached"))
    resolved  = _safe_int(d.get("resolved_count"))
    total_hrs = _safe_float(d.get("total_hours"))

    completion_rate = round(completed / total * 100, 1) if total > 0 else 0
    breach_rate     = round(breached / total * 100, 1) if total > 0 else 0
    avg_resolution  = round(total_hrs / resolved, 1) if resolved > 0 else 0
    sla_target      = 95.0
    sla_status      = "compliant" if completion_rate >= sla_target else "at_risk"

    return {
        "total_work_orders":    total,
        "completed":            completed,
        "sla_breached":         breached,
        "completion_rate_pct":  completion_rate,
        "breach_rate_pct":      breach_rate,
        "avg_resolution_hours": avg_resolution,
        "sla_target_pct":       sla_target,
        "sla_status":           sla_status,
        "critical_open":        _safe_int(d.get("critical_open")),
        "critical_total":       _safe_int(d.get("critical_total")),
        "generated_at":         _dt.utcnow().isoformat(),
    }

@router.get("/by-hotel", summary="SLA compliance per hotel")
def sla_by_hotel(hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """SLA breakdown by hotel — shows which clients have highest breach rates."""
    try:
        rows = db.execute(text("""
            SELECT
                wo.hotel_id,
                h.name as hotel_name,
                count(*) as total,
                sum(CASE WHEN wo.status IN ('completed','closed') THEN 1 ELSE 0 END) as completed,
                sum(CASE WHEN wo.due_date < NOW()
                         AND wo.status NOT IN ('completed','closed','cancelled')
                         THEN 1 ELSE 0 END) as breached,
                sum(CASE WHEN wo.priority = 'critical'
                         AND wo.status NOT IN ('completed','closed','cancelled')
                         THEN 1 ELSE 0 END) as critical_open
            FROM work_orders wo
            LEFT JOIN hotels h ON h.id = wo.hotel_id
            GROUP BY wo.hotel_id, h.name
            ORDER BY breached DESC
            LIMIT 20
        """)).fetchall()
    except Exception:
        rows = []

    hotels = []
    for row in rows:
        r = row_to_dict(row)
        total     = _safe_int(r.get("total"))
        completed = _safe_int(r.get("completed"))
        breached  = _safe_int(r.get("breached"))
        rate      = round(completed / total * 100, 1) if total > 0 else 0
        r["completion_rate_pct"] = rate
        r["sla_status"] = "compliant" if rate >= 95 else "at_risk" if rate >= 80 else "critical"
        hotels.append(r)

    return {"hotels": hotels, "total": len(hotels),
            "generated_at": _dt.utcnow().isoformat()}

@router.get("/by-priority", summary="SLA compliance by priority")
def sla_by_priority(hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """Resolution time and compliance by work order priority."""
    try:
        rows = db.execute(text("""
            SELECT
                priority,
                count(*) as total,
                sum(CASE WHEN status IN ('completed','closed') THEN 1 ELSE 0 END) as completed,
                sum(CASE WHEN due_date < NOW()
                         AND status NOT IN ('completed','closed','cancelled')
                         THEN 1 ELSE 0 END) as breached,
                COALESCE(avg(CASE WHEN completed_at IS NOT NULL AND started_at IS NOT NULL
                    THEN EXTRACT(EPOCH FROM (completed_at - started_at))/3600
                    END), 0) as avg_hours
            FROM work_orders
            GROUP BY priority
            ORDER BY CASE priority
                WHEN 'critical' THEN 1 WHEN 'high' THEN 2
                WHEN 'medium' THEN 3 ELSE 4 END
        """)).fetchall()
    except Exception:
        rows = []

    result = []
    for row in rows:
        r = row_to_dict(row)
        total     = _safe_int(r.get("total"))
        completed = _safe_int(r.get("completed"))
        rate      = round(completed / total * 100, 1) if total > 0 else 0
        r["completion_rate_pct"] = rate
        r["avg_resolution_hours"] = round(_safe_float(r.get("avg_hours")), 1)
        result.append(r)

    return {"by_priority": result, "generated_at": _dt.utcnow().isoformat()}

@router.get("/trends", summary="SLA trend last 6 months")
def sla_trends(hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """Monthly SLA compliance trend for charts."""
    try:
        rows = db.execute(text("""
            SELECT
                DATE_TRUNC('month', created_at) as month,
                count(*) as total,
                sum(CASE WHEN status IN ('completed','closed') THEN 1 ELSE 0 END) as completed,
                sum(CASE WHEN due_date < completed_at AND status = 'completed'
                         THEN 1 ELSE 0 END) as late_completions
            FROM work_orders
            WHERE created_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month ASC
        """)).fetchall()
    except Exception:
        rows = []

    trends = []
    for row in rows:
        r = row_to_dict(row)
        total     = _safe_int(r.get("total"))
        completed = _safe_int(r.get("completed"))
        rate      = round(completed / total * 100, 1) if total > 0 else 0
        trends.append({
            "month":           str(r.get("month",""))[:7],
            "total":           total,
            "completed":       completed,
            "compliance_pct":  rate,
            "late_completions": _safe_int(r.get("late_completions")),
        })

    return {"trends": trends, "months": len(trends),
            "generated_at": _dt.utcnow().isoformat()}
