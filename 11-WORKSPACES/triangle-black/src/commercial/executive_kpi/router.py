from __future__ import annotations
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

from src.core.auth import get_current_user as _gcu_v7
from fastapi import Depends as _Dep_v7
router = APIRouter(prefix="/executive-kpi", tags=["executive-kpi"], dependencies=[_Dep_v7(_gcu_v7)])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _safe_float(v):
    try: return float(v or 0)
    except: return 0.0

def _safe_int(v):
    try: return int(v or 0)
    except: return 0

@router.get("/summary", summary="Executive KPI summary")
def kpi_summary(db: Session = Depends(get_db)):
    """Current period KPIs for CEO/COO dashboard."""
    now = datetime.datetime.utcnow()

    # Revenue this month
    rev = {}
    try:
        row = db.execute(text("""
            SELECT COALESCE(sum(total_amount),0) as monthly,
                   count(*) as invoice_count
            FROM invoices
            WHERE created_at >= DATE_TRUNC('month', NOW())
              AND status IN ('paid','partially_paid')
        """)).fetchone()
        rev = row_to_dict(row)
    except Exception:
        pass

    # WO completion rate
    wo = {}
    try:
        row = db.execute(text("""
            SELECT count(*) as total,
                   sum(CASE WHEN status IN ('completed','closed') THEN 1 ELSE 0 END) as done,
                   sum(CASE WHEN priority='critical'
                            AND status NOT IN ('completed','closed','cancelled')
                            THEN 1 ELSE 0 END) as critical_open
            FROM work_orders
            WHERE created_at >= DATE_TRUNC('month', NOW())
        """)).fetchone()
        wo = row_to_dict(row)
    except Exception:
        pass

    # Active contracts value
    contracts = {}
    try:
        row = db.execute(text("""
            SELECT count(*) as active,
                   COALESCE(sum(total_value),0) as portfolio_value,
                   sum(CASE WHEN end_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
                            THEN 1 ELSE 0 END) as expiring_30
            FROM contracts WHERE status = 'active'
        """)).fetchone()
        contracts = row_to_dict(row)
    except Exception:
        pass

    # Technician utilization
    tech = {}
    try:
        row = db.execute(text("""
            SELECT count(*) as total,
                   COALESCE(avg(current_work_orders::float / NULLIF(max_work_orders,0) * 100), 0) as avg_util
            FROM technicians WHERE is_active = true
        """)).fetchone()
        tech = row_to_dict(row)
    except Exception:
        pass

    total_wo    = _safe_int(wo.get("total"))
    completed   = _safe_int(wo.get("done"))
    completion  = round(completed / total_wo * 100, 1) if total_wo > 0 else 0

    return {
        "period":               now.strftime("%B %Y"),
        "revenue_egp":          round(_safe_float(rev.get("monthly")), 2),
        "invoice_count":        _safe_int(rev.get("invoice_count")),
        "wo_completion_pct":    completion,
        "critical_open_wos":    _safe_int(wo.get("critical_open")),
        "active_contracts":     _safe_int(contracts.get("active")),
        "portfolio_value_egp":  round(_safe_float(contracts.get("portfolio_value")), 2),
        "contracts_expiring_30": _safe_int(contracts.get("expiring_30")),
        "technician_utilization_pct": round(_safe_float(tech.get("avg_util")), 1),
        "currency":             "EGP",
        "generated_at":         now.isoformat(),
    }

@router.get("/trends/revenue", summary="Revenue trend last 6 months")
def revenue_trend(db: Session = Depends(get_db)):
    """Monthly revenue for sparkline chart."""
    try:
        rows = db.execute(text("""
            SELECT DATE_TRUNC('month', created_at) as month,
                   COALESCE(sum(total_amount), 0) as revenue,
                   count(*) as invoice_count
            FROM invoices
            WHERE created_at >= NOW() - INTERVAL '6 months'
              AND status IN ('paid','partially_paid','unpaid')
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month ASC
        """)).fetchall()
    except Exception:
        rows = []

    return {
        "months": [{"month": str(row_to_dict(r).get("month",""))[:7],
                    "revenue_egp": round(_safe_float(row_to_dict(r).get("revenue")), 2),
                    "invoice_count": _safe_int(row_to_dict(r).get("invoice_count"))}
                   for r in rows],
        "currency": "EGP",
        "generated_at": datetime.datetime.utcnow().isoformat(),
    }

@router.get("/trends/operations", summary="Operations trend last 6 months")
def operations_trend(db: Session = Depends(get_db)):
    """Monthly work order volume + completion for sparklines."""
    try:
        rows = db.execute(text("""
            SELECT DATE_TRUNC('month', created_at) as month,
                   count(*) as total,
                   sum(CASE WHEN status IN ('completed','closed') THEN 1 ELSE 0 END) as completed,
                   sum(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical
            FROM work_orders
            WHERE created_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month ASC
        """)).fetchall()
    except Exception:
        rows = []

    return {
        "months": [{"month": str(row_to_dict(r).get("month",""))[:7],
                    "total": _safe_int(row_to_dict(r).get("total")),
                    "completed": _safe_int(row_to_dict(r).get("completed")),
                    "critical": _safe_int(row_to_dict(r).get("critical"))}
                   for r in rows],
        "generated_at": datetime.datetime.utcnow().isoformat(),
    }

@router.get("/scorecard", summary="Executive balanced scorecard")
def executive_scorecard(db: Session = Depends(get_db)):
    """Full balanced scorecard — Financial + Operations + Customer + Internal."""
    summary = kpi_summary(db=db)
    rev_trend  = revenue_trend(db=db)
    ops_trend  = operations_trend(db=db)

    # Score each dimension 0-100
    fin_score  = min(100, int(summary.get("wo_completion_pct", 0)))
    ops_score  = max(0, 100 - summary.get("critical_open_wos", 0) * 5)
    cust_score = min(100, int(summary.get("technician_utilization_pct", 50)))

    return {
        "scorecard": {
            "financial":   {"score": fin_score,  "label": "Revenue & Billing"},
            "operations":  {"score": ops_score,  "label": "Work Order Completion"},
            "customer":    {"score": cust_score, "label": "Service Delivery"},
            "overall":     {"score": round((fin_score + ops_score + cust_score) / 3, 1)},
        },
        "kpis":       summary,
        "rev_trend":  rev_trend.get("months", []),
        "ops_trend":  ops_trend.get("months", []),
        "generated_at": datetime.datetime.utcnow().isoformat(),
    }
