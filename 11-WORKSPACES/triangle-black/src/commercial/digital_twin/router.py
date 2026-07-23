from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
import datetime

router = APIRouter(prefix="/twin", tags=["digital-twin"])

def safe_int(v, d=0):
    try: return int(v) if v is not None else d
    except: return d

def safe_float(v, d=0.0):
    try: return float(v) if v is not None else d
    except: return d

# ─────────────────────────────────────────────────────────────────────────────
# S68-05: Digital Twin — Live Operational State Snapshot
# Reads current state from all operational tables
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/state", summary="Current operational state of the entire company")
def get_twin_state(db: Session = Depends(get_db)):
    """
    The Digital Twin state endpoint.
    Returns a live snapshot of every operational domain.
    This is the single source of truth for the platform state.
    """
    now = datetime.datetime.utcnow()

    # Work Orders Domain
    wo = db.execute(text("""
        SELECT
            COUNT(*)                                                  AS total,
            COUNT(*) FILTER (WHERE status = 'open')                   AS open,
            COUNT(*) FILTER (WHERE status = 'in_progress')            AS in_progress,
            COUNT(*) FILTER (WHERE status = 'waiting_parts')          AS waiting_parts,
            COUNT(*) FILTER (WHERE status = 'completed')              AS completed,
            COUNT(*) FILTER (WHERE priority = 'critical'
                AND status NOT IN ('completed','closed','cancelled'))  AS critical_open,
            COUNT(*) FILTER (WHERE due_date < NOW()
                AND status NOT IN ('completed','closed','cancelled'))  AS overdue
        FROM work_orders
    """)).fetchone()

    # Asset Domain
    assets = db.execute(text("""
        SELECT
            COUNT(*)                                               AS total,
            COUNT(*) FILTER (WHERE status = 'operational')         AS operational,
            COUNT(*) FILTER (WHERE status = 'under_maintenance')   AS under_maintenance,
            COUNT(*) FILTER (WHERE criticality = 'critical')       AS critical_count
        FROM assets
    """)).fetchone()

    # Technician Domain
    tech = db.execute(text("""
        SELECT
            COUNT(*)                                             AS total,
            COUNT(*) FILTER (WHERE is_active = true)             AS active,
            COUNT(*) FILTER (WHERE current_work_orders = 0
                AND is_active = true)                             AS available,
            SUM(current_work_orders)                             AS total_assigned,
            SUM(max_work_orders)                                 AS total_capacity
        FROM technicians
    """)).fetchone()

    # Inventory Domain
    inv = db.execute(text("""
        SELECT
            COUNT(DISTINCT i.id)                                   AS total_items,
            COUNT(DISTINCT i.id) FILTER (
                WHERE COALESCE(sb.qty, 0) <= i.min_stock)          AS below_min,
            COUNT(DISTINCT w.id)                                   AS warehouses
        FROM inventory_items i
        LEFT JOIN (
            SELECT item_id, SUM(quantity) AS qty
            FROM stock_balances GROUP BY item_id
        ) sb ON sb.item_id = i.id
        CROSS JOIN (SELECT COUNT(*) AS id FROM warehouses) w
    """)).fetchone()

    # Procurement Domain
    proc = db.execute(text("""
        SELECT
            COUNT(*) FILTER (WHERE status = 'pending')     AS pr_pending,
            COUNT(*) FILTER (WHERE status = 'approved')    AS pr_approved,
            COUNT(*)                                        AS pr_total
        FROM purchase_requests
    """)).fetchone()

    po = db.execute(text("""
        SELECT
            COUNT(*) FILTER (WHERE status NOT IN ('received','cancelled')) AS open_pos,
            COALESCE(SUM(total_amount)
                FILTER (WHERE status NOT IN ('received','cancelled')), 0) AS open_value
        FROM purchase_orders
    """)).fetchone()

    # Revenue Domain
    rev = db.execute(text("""
        SELECT
            COALESCE(SUM(total_amount), 0)                                AS total_invoiced,
            COALESCE(SUM(total_amount) FILTER (WHERE status = 'paid'), 0) AS collected,
            COUNT(*) FILTER (WHERE status = 'overdue')                    AS overdue_invoices
        FROM invoices
    """)).fetchone()

    # Maintenance Domain
    maint = db.execute(text("""
        SELECT
            COUNT(*)                                             AS total_plans,
            COUNT(*) FILTER (WHERE next_due_date < NOW()
                AND status NOT IN ('completed','cancelled'))     AS overdue_plans,
            COUNT(*) FILTER (WHERE next_due_date BETWEEN NOW()
                AND NOW() + INTERVAL '7 days'
                AND status NOT IN ('completed','cancelled'))     AS due_this_week
        FROM maintenance_plans
    """)).fetchone()

    # Compute aggregate health score (0-100)
    wo_total    = safe_int(wo.total if wo else 0)
    wo_crit     = safe_int(wo.critical_open if wo else 0)
    wo_overdue  = safe_int(wo.overdue if wo else 0)
    tech_total  = safe_int(tech.total if tech else 0)
    tech_avail  = safe_int(tech.available if tech else 0)
    inv_below   = safe_int(inv.below_min if inv else 0)
    pm_overdue  = safe_int(maint.overdue_plans if maint else 0)

    health_deductions = (
        min(wo_crit  * 5,  30) +
        min(wo_overdue * 2, 20) +
        min(inv_below * 3, 15) +
        min(pm_overdue * 3, 15)
    )
    health_score = max(0, 100 - health_deductions)
    health_status = (
        "critical" if health_score < 50 else
        "at_risk"  if health_score < 75 else
        "healthy"
    )

    return {
        "twin_id":      "triangle-black-operations-twin",
        "generated_at": now.isoformat(),
        "health": {
            "score":  health_score,
            "status": health_status,
            "label":  f"Operations Health: {health_score}/100",
        },
        "domains": {
            "work_orders": {
                "total":        safe_int(wo.total if wo else 0),
                "open":         safe_int(wo.open if wo else 0),
                "in_progress":  safe_int(wo.in_progress if wo else 0),
                "waiting_parts":safe_int(wo.waiting_parts if wo else 0),
                "completed":    safe_int(wo.completed if wo else 0),
                "critical_open":wo_crit,
                "overdue":      wo_overdue,
            },
            "assets": {
                "total":             safe_int(assets.total if assets else 0),
                "operational":       safe_int(assets.operational if assets else 0),
                "under_maintenance": safe_int(assets.under_maintenance if assets else 0),
                "critical_count":    safe_int(assets.critical_count if assets else 0),
            },
            "technicians": {
                "total":          tech_total,
                "active":         safe_int(tech.active if tech else 0),
                "available":      tech_avail,
                "total_assigned": safe_int(tech.total_assigned if tech else 0),
                "total_capacity": safe_int(tech.total_capacity if tech else 0),
                "utilization_pct":round(
                    safe_int(tech.total_assigned if tech else 0) /
                    max(safe_int(tech.total_capacity if tech else 1), 1) * 100, 1
                ),
            },
            "inventory": {
                "total_items": safe_int(inv.total_items if inv else 0),
                "below_min":   safe_int(inv.below_min if inv else 0),
                "warehouses":  safe_int(inv.warehouses if inv else 0),
            },
            "procurement": {
                "pr_pending":  safe_int(proc.pr_pending if proc else 0),
                "pr_approved": safe_int(proc.pr_approved if proc else 0),
                "open_pos":    safe_int(po.open_pos if po else 0),
                "open_po_value": round(safe_float(po.open_value if po else 0), 2),
            },
            "revenue": {
                "total_invoiced":    round(safe_float(rev.total_invoiced if rev else 0), 2),
                "collected":         round(safe_float(rev.collected if rev else 0), 2),
                "overdue_invoices":  safe_int(rev.overdue_invoices if rev else 0),
            },
            "maintenance": {
                "total_plans":   safe_int(maint.total_plans if maint else 0),
                "overdue_plans": pm_overdue,
                "due_this_week": safe_int(maint.due_this_week if maint else 0),
            },
        },
        "currency": "EGP",
    }
