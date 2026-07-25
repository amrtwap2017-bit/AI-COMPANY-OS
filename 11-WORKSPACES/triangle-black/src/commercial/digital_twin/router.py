from __future__ import annotations
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db

router = APIRouter(prefix="/twin", tags=["digital-twin"])

def _safe_int(val):
    try:
        return int(val or 0)
    except Exception:
        return 0

def _safe_float(val):
    try:
        return float(val or 0)
    except Exception:
        return 0.0

def _query(db, sql, params=None):
    try:
        row = db.execute(text(sql), params or {}).fetchone()
        if row is None:
            return {}
        if hasattr(row, "_mapping"):
            return dict(row._mapping)
        return {}
    except Exception as _e:
        import sys
        print(f"[twin._query] ERROR: {_e}", file=sys.stderr)
        try:
            db.rollback()
        except Exception:
            pass
        return {}

@router.get("/state", summary="Digital Twin operational state")
def get_twin_state(db: Session = Depends(get_db)):
    """
    Program M — Digital Twin.
    Returns live operational snapshot. Always returns valid JSON.
    Health score: 100 minus deductions for operational issues.
    """
    health = 100
    now    = datetime.datetime.utcnow()

    # Work Orders
    wo = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN status IN ('open','assigned','in_progress') THEN 1 ELSE 0 END) as active,
               sum(CASE WHEN priority='critical' AND status NOT IN ('completed','closed','cancelled') THEN 1 ELSE 0 END) as critical_open,
               sum(CASE WHEN due_date < NOW() AND status NOT IN ('completed','closed','cancelled') THEN 1 ELSE 0 END) as overdue
        FROM work_orders
    """)
    critical_open = _safe_int(wo.get("critical_open"))
    overdue_wo    = _safe_int(wo.get("overdue"))
    health -= min(25, critical_open * 3)
    health -= min(10, overdue_wo * 2)

    # Technicians
    tech = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN is_active THEN 1 ELSE 0 END) as active,
               sum(CASE WHEN current_work_orders >= max_work_orders THEN 1 ELSE 0 END) as at_capacity
        FROM technicians
    """)
    health -= min(10, _safe_int(tech.get("at_capacity")) * 2)

    # Assets
    ast = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN status='active' THEN 1 ELSE 0 END) as active,
               sum(CASE WHEN criticality='critical' THEN 1 ELSE 0 END) as critical_count
        FROM assets
    """)

    # Inventory
    inv = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN quantity IS NOT NULL AND quantity <= 0 THEN 1 ELSE 0 END) as below_min
        FROM inventory_items
    """)
    health -= min(10, _safe_int(inv.get("below_min")) * 2)

    # Finance
    fin = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN status IN ('sent','draft') THEN 1 ELSE 0 END) as unpaid,
               sum(CASE WHEN status='overdue' THEN 1 ELSE 0 END) as overdue_inv,
               COALESCE(sum(amount), 0) as total_value
        FROM invoices
    """)
    health -= min(10, _safe_int(fin.get("overdue_inv")) * 3)

    # Maintenance
    maint = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN next_due_date < NOW() AND status='active' THEN 1 ELSE 0 END) as overdue
        FROM maintenance_plans
    """)
    health -= min(10, _safe_int(maint.get("overdue")) * 2)

    # Projects
    proj = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN status='active' THEN 1 ELSE 0 END) as active
        FROM projects
    """)

    # Contracts
    contracts = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN status='active' THEN 1 ELSE 0 END) as active,
               sum(CASE WHEN end_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
                        AND status='active' THEN 1 ELSE 0 END) as expiring_30
        FROM contracts
    """)

    health = max(0, min(100, health))

    if health >= 80:
        label = "Healthy"
    elif health >= 60:
        label = "Warning"
    elif health >= 40:
        label = "Degraded"
    else:
        label = "Critical"

    return {
        "health_score":  health,
        "health_label":  label,
        "generated_at":  now.isoformat(),
        "platform":      "Triangle Black Enterprise Operations Platform",
        "version":       "2.0-sprint74",
        "operational_domains": [
            {"domain": "Work Orders",  "total": _safe_int(wo.get("total")),
             "active": _safe_int(wo.get("active")),
             "critical_open": critical_open, "overdue": overdue_wo},
            {"domain": "Technicians",  "total": _safe_int(tech.get("total")),
             "active": _safe_int(tech.get("active")),
             "at_capacity": _safe_int(tech.get("at_capacity"))},
            {"domain": "Assets",       "total": _safe_int(ast.get("total")),
             "active": _safe_int(ast.get("active")),
             "critical": _safe_int(ast.get("critical_count"))},
            {"domain": "Inventory",    "total": _safe_int(inv.get("total")),
             "below_min": _safe_int(inv.get("below_min"))},
            {"domain": "Finance",      "total": _safe_int(fin.get("total")),
             "unpaid": _safe_int(fin.get("unpaid")),
             "overdue": _safe_int(fin.get("overdue_inv")),
             "total_value_egp": _safe_float(fin.get("total_value"))},
            {"domain": "Maintenance",  "total": _safe_int(maint.get("total")),
             "overdue": _safe_int(maint.get("overdue"))},
            {"domain": "Projects",     "total": _safe_int(proj.get("total")),
             "active": _safe_int(proj.get("active"))},
            {"domain": "Contracts",    "total": _safe_int(contracts.get("total")),
             "active": _safe_int(contracts.get("active")),
             "expiring_30": _safe_int(contracts.get("expiring_30"))},
        ],
    }
