"""
Executive Dashboard Router — Sprint-020
Real aggregated data from all operational tables.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter()


def _safe_float(v):
    try: return float(v or 0)
    except: return 0.0


def _safe_int(v):
    try: return int(v or 0)
    except: return 0


@router.get("/executive/dashboard")
def get_executive_dashboard(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """
    Single aggregated endpoint for Executive Dashboard.
    Returns operations, financial, alerts sections.
    hotel_id from JWT — tenant-isolated.
    """

    # ── Work Orders ────────────────────────────────────────────────────────────
    wo = {"open": 0, "in_progress": 0, "completed": 0, "total": 0, "overdue": 0, "critical_open": 0}
    try:
        row = db.execute(text("""
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status IN ('completed','closed') THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN due_date < NOW()
                         AND status NOT IN ('completed','closed','cancelled')
                         THEN 1 ELSE 0 END) as overdue,
                SUM(CASE WHEN priority = 'critical'
                         AND status NOT IN ('completed','closed','cancelled')
                         THEN 1 ELSE 0 END) as critical_open
            FROM work_orders
            WHERE hotel_id = :hid
              AND (deleted_at IS NULL OR deleted_at > NOW())
        """), {"hid": hotel_id}).fetchone()
        if row:
            wo = {
                "total":        _safe_int(row[0]),
                "open":         _safe_int(row[1]),
                "in_progress":  _safe_int(row[2]),
                "completed":    _safe_int(row[3]),
                "overdue":      _safe_int(row[4]),
                "critical_open":_safe_int(row[5]),
            }
    except Exception:
        pass

    # ── Service Requests ───────────────────────────────────────────────────────
    sr = {"open": 0, "total": 0, "critical": 0}
    try:
        row = db.execute(text("""
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status IN ('open','pending') THEN 1 ELSE 0 END) as open,
                SUM(CASE WHEN urgency = 'critical' AND status NOT IN ('resolved','closed') THEN 1 ELSE 0 END) as critical
            FROM service_requests
            WHERE hotel_id = :hid
              AND (deleted_at IS NULL OR deleted_at > NOW())
        """), {"hid": hotel_id}).fetchone()
        if row:
            sr = {"total": _safe_int(row[0]), "open": _safe_int(row[1]), "critical": _safe_int(row[2])}
    except Exception:
        pass

    # ── Invoices ───────────────────────────────────────────────────────────────
    inv = {"total_amount": 0, "paid": 0, "outstanding": 0, "count": 0}
    try:
        row = db.execute(text("""
            SELECT
                COUNT(*) as count,
                COALESCE(SUM(total_amount), 0) as total_amount,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as paid,
                COALESCE(SUM(CASE WHEN status IN ('sent','overdue','partially_paid') THEN total_amount ELSE 0 END), 0) as outstanding
            FROM invoices
            WHERE hotel_id = :hid
        """), {"hid": hotel_id}).fetchone()
        if row:
            inv = {
                "count":        _safe_int(row[0]),
                "total_amount": _safe_float(row[1]),
                "paid":         _safe_float(row[2]),
                "outstanding":  _safe_float(row[3]),
            }
    except Exception:
        pass

    # ── Purchase Orders ────────────────────────────────────────────────────────
    po = {"total_pos": 0, "total_spend": 0, "pending_approval": 0}
    try:
        row = db.execute(text("""
            SELECT
                COUNT(*) as total_pos,
                COALESCE(SUM(total_amount), 0) as total_spend,
                SUM(CASE WHEN status IN ('pending','draft') THEN 1 ELSE 0 END) as pending_approval
            FROM purchase_orders
            WHERE hotel_id = :hid
        """), {"hid": hotel_id}).fetchone()
        if row:
            po = {
                "total_pos":       _safe_int(row[0]),
                "total_spend":     _safe_float(row[1]),
                "pending_approval":_safe_int(row[2]),
            }
    except Exception:
        pass

    # ── Projects (from project_records if exists) ──────────────────────────────
    proj = {"active": 0, "total_budget": 0}
    try:
        row = db.execute(text("""
            SELECT
                SUM(CASE WHEN status IN ('active','in_progress') THEN 1 ELSE 0 END) as active,
                COALESCE(SUM(budget), 0) as total_budget
            FROM projects
            WHERE hotel_id = :hid
        """), {"hid": hotel_id}).fetchone()
        if row:
            proj = {"active": _safe_int(row[0]), "total_budget": _safe_float(row[1])}
    except Exception:
        pass

    # ── Alerts ────────────────────────────────────────────────────────────────
    alerts = {"total_alerts": 0, "critical": 0}
    try:
        alerts["critical"] = wo.get("critical_open", 0) + sr.get("critical", 0)
        alerts["total_alerts"] = wo.get("overdue", 0) + alerts["critical"]
    except Exception:
        pass

    # ── SLA (simple compliance from work orders) ───────────────────────────────
    sla_data = {"compliance_rate": 0.0, "site_sla": [], "total_checked": 0}
    try:
        total = wo.get("total", 0)
        overdue = wo.get("overdue", 0)
        if total > 0:
            sla_data["compliance_rate"] = round((total - overdue) / total * 100, 1)
        sla_data["total_checked"] = total
    except Exception:
        pass

    return {
        "operations": {
            "work_orders":       wo,
            "service_requests":  sr,
        },
        "financial": {
            "invoices": inv,
            "projects": proj,
        },
        "procurement": po,
        "alerts": alerts,
        "sla": sla_data,
        "generated_at": str(__import__("datetime").datetime.utcnow().isoformat()),
    }


@router.get("/executive")
def get_executive_legacy(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """Legacy endpoint — delegates to /executive/dashboard for backward compat."""
    return get_executive_dashboard(hotel_id, db)
