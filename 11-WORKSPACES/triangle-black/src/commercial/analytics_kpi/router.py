from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from typing import Optional
import datetime

router = APIRouter(prefix="/analytics", tags=["analytics-kpi"])

def safe_float(v, default=0.0):
    try: return float(v) if v is not None else default
    except: return default

def safe_int(v, default=0):
    try: return int(v) if v is not None else default
    except: return default

# ─────────────────────────────────────────────────────────────────────────────
# S68-02: KPI Endpoint Fix
# Fixes the 404 that frontend analytics pages were hitting
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/kpis", summary="Enterprise KPI summary")
@router.get("/kpis/", summary="Enterprise KPI summary")
def get_kpis(db: Session = Depends(get_db)):
    """
    Main KPI endpoint used by analytics pages.
    Aggregates from: work_orders, technicians, invoices, contracts, inventory.
    """
    now = datetime.datetime.utcnow()
    today_str = now.strftime("%Y-%m-%d")

    # Work order KPIs
    wo = db.execute(text("""
        SELECT
            COUNT(*)                                              AS total,
            COUNT(*) FILTER (WHERE status = 'open')              AS open_count,
            COUNT(*) FILTER (WHERE status = 'in_progress')       AS in_progress,
            COUNT(*) FILTER (WHERE status = 'completed')         AS completed,
            COUNT(*) FILTER (WHERE priority = 'critical'
                             AND status NOT IN ('completed','closed','cancelled'))
                                                                  AS critical_open,
            COUNT(*) FILTER (WHERE due_date < NOW()
                             AND status NOT IN ('completed','closed','cancelled'))
                                                                  AS overdue,
            AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600)
                FILTER (WHERE completed_at IS NOT NULL)           AS avg_completion_hours
        FROM work_orders
    """)).fetchone()

    # Technician KPIs
    tech = db.execute(text("""
        SELECT
            COUNT(*)                                      AS total,
            COUNT(*) FILTER (WHERE is_active = true)      AS active,
            AVG(current_work_orders::float /
                NULLIF(max_work_orders, 0) * 100)          AS avg_utilization
        FROM technicians
    """)).fetchone()

    # Invoice KPIs
    inv = db.execute(text("""
        SELECT
            COUNT(*)                                            AS total,
            COALESCE(SUM(total_amount), 0)                      AS total_revenue,
            COALESCE(SUM(total_amount) FILTER (WHERE status = 'paid'), 0)
                                                                AS collected,
            COALESCE(SUM(total_amount) FILTER (WHERE status IN ('sent','overdue')), 0)
                                                                AS outstanding
        FROM invoices
    """)).fetchone()

    # Contract KPIs
    con = db.execute(text("""
        SELECT
            COUNT(*)                                                          AS total,
            COUNT(*) FILTER (WHERE status = 'active')                         AS active,
            COUNT(*) FILTER (WHERE end_date BETWEEN NOW()
                             AND NOW() + INTERVAL '30 days')                  AS expiring_30d,
            COALESCE(SUM(value), 0)                                           AS total_value
        FROM contracts
    """)).fetchone()

    # SLA KPIs
    sla = db.execute(text("""
        SELECT
            COUNT(*) FILTER (WHERE completed_at IS NOT NULL)  AS completed_in_sla,
            COUNT(*) FILTER (WHERE due_date < completed_at
                             AND completed_at IS NOT NULL)     AS breached,
            COUNT(*)                                           AS total_closed
        FROM work_orders
        WHERE status IN ('completed', 'closed')
    """)).fetchone()

    sla_total    = safe_int(sla.total_closed if sla else 0)
    sla_breached = safe_int(sla.breached if sla else 0)
    sla_rate     = round((sla_total - sla_breached) / max(sla_total, 1) * 100, 1)

    return {
        "generated_at": now.isoformat(),
        "work_orders": {
            "total":              safe_int(wo.total if wo else 0),
            "open":               safe_int(wo.open_count if wo else 0),
            "in_progress":        safe_int(wo.in_progress if wo else 0),
            "completed":          safe_int(wo.completed if wo else 0),
            "critical_open":      safe_int(wo.critical_open if wo else 0),
            "overdue":            safe_int(wo.overdue if wo else 0),
            "avg_completion_hrs": round(safe_float(wo.avg_completion_hours if wo else 0), 1),
        },
        "technicians": {
            "total":           safe_int(tech.total if tech else 0),
            "active":          safe_int(tech.active if tech else 0),
            "avg_utilization": round(safe_float(tech.avg_utilization if tech else 0), 1),
        },
        "revenue": {
            "total_invoiced":  round(safe_float(inv.total_revenue if inv else 0), 2),
            "collected":       round(safe_float(inv.collected if inv else 0), 2),
            "outstanding":     round(safe_float(inv.outstanding if inv else 0), 2),
            "invoice_count":   safe_int(inv.total if inv else 0),
        },
        "contracts": {
            "total":          safe_int(con.total if con else 0),
            "active":         safe_int(con.active if con else 0),
            "expiring_30d":   safe_int(con.expiring_30d if con else 0),
            "total_value":    round(safe_float(con.total_value if con else 0), 2),
        },
        "sla": {
            "compliance_rate": sla_rate,
            "total_closed":    sla_total,
            "breached":        sla_breached,
            "target":          95.0,
            "status":          "compliant" if sla_rate >= 95 else "at_risk",
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# S68-03: Cash Flow Engine (Program I)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/cashflow", summary="Monthly cash flow — inflow vs outflow")
def get_cashflow(months: int = Query(default=6, le=12), db: Session = Depends(get_db)):
    """
    Returns monthly cash flow for the last N months.
    Inflow:  invoices (paid + sent)
    Outflow: purchase_orders (received/approved)
    """
    result = []
    now    = datetime.datetime.utcnow()

    for i in range(months - 1, -1, -1):
        month_start = (now.replace(day=1) - datetime.timedelta(days=i * 30)).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        # Last day of month
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1)

        label = month_start.strftime("%b %Y")

        # Inflow from invoices
        inflow_row = db.execute(text("""
            SELECT COALESCE(SUM(total_amount), 0) AS total
            FROM invoices
            WHERE created_at >= :start AND created_at < :end
        """), {"start": month_start, "end": month_end}).fetchone()

        # Outflow from purchase orders
        outflow_row = db.execute(text("""
            SELECT COALESCE(SUM(total_amount), 0) AS total
            FROM purchase_orders
            WHERE created_at >= :start AND created_at < :end
            AND status NOT IN ('cancelled', 'rejected')
        """), {"start": month_start, "end": month_end}).fetchone()

        inflow  = round(safe_float(inflow_row.total if inflow_row else 0), 2)
        outflow = round(safe_float(outflow_row.total if outflow_row else 0), 2)

        result.append({
            "month":   label,
            "inflow":  inflow,
            "outflow": outflow,
            "net":     round(inflow - outflow, 2),
        })

    # Summary
    total_in  = sum(m["inflow"]  for m in result)
    total_out = sum(m["outflow"] for m in result)

    return {
        "months":    result,
        "summary": {
            "total_inflow":  round(total_in, 2),
            "total_outflow": round(total_out, 2),
            "net_cashflow":  round(total_in - total_out, 2),
            "period_months": months,
        },
        "currency":     "EGP",
        "generated_at": now.isoformat(),
    }


@router.get("/trends", summary="Revenue and lead trends")
def get_trends(db: Session = Depends(get_db)):
    """Monthly revenue trend + lead conversion for the last 6 months."""
    now    = datetime.datetime.utcnow()
    result = []

    for i in range(5, -1, -1):
        month_start = (now.replace(day=1) - datetime.timedelta(days=i * 30)).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1)

        label = month_start.strftime("%b")

        rev = db.execute(text("""
            SELECT COALESCE(SUM(total_amount), 0) AS revenue
            FROM invoices WHERE created_at >= :s AND created_at < :e
        """), {"s": month_start, "e": month_end}).fetchone()

        leads_won = db.execute(text("""
            SELECT COUNT(*) AS cnt FROM leads
            WHERE status = 'won' AND created_at >= :s AND created_at < :e
        """), {"s": month_start, "e": month_end}).fetchone()

        leads_total = db.execute(text("""
            SELECT COUNT(*) AS cnt FROM leads
            WHERE created_at >= :s AND created_at < :e
        """), {"s": month_start, "e": month_end}).fetchone()

        total_l = safe_int(leads_total.cnt if leads_total else 0)
        won_l   = safe_int(leads_won.cnt if leads_won else 0)
        conv    = round(won_l / max(total_l, 1) * 100, 1)

        result.append({
            "month":            label,
            "revenue":          round(safe_float(rev.revenue if rev else 0), 2),
            "leads_total":      total_l,
            "leads_won":        won_l,
            "conversion_rate":  conv,
        })

    return {
        "trends":       result,
        "generated_at": datetime.datetime.utcnow().isoformat(),
    }
