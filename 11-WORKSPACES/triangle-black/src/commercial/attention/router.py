"""
V8-S05 — Attention Dashboard API
What needs my attention today?
"""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.auth import get_current_user
from src.core.tenant import get_hotel_id
from datetime import datetime as _dt

router = APIRouter(prefix="/attention", tags=["attention"])

@router.get("/", summary="What needs attention today?")
def get_attention_dashboard(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    H = hotel_id
    import logging as _log_att
    _logger_att = _log_att.getLogger("tb.attention")

    def _q(sql, params=None):
        try:
            result = db.execute(text(sql), params or {"h": H}).fetchall()
            return result
        except Exception as _e:
            _logger_att.warning(f"[attention._q] Query failed: {_e}")
            try: db.rollback()
            except: pass
            return []
    def _s(sql, params=None):
        try:
            val = db.execute(text(sql), params or {"h": H}).scalar()
            return val or 0
        except Exception as _e:
            _logger_att.warning(f"[attention._s] Query failed: {_e}")
            try: db.rollback()
            except: pass
            return 0

    critical_wos = _q("""
        SELECT id, title, priority, status, asset_id, created_at
        FROM work_orders WHERE hotel_id=:h
        AND priority IN ('critical','emergency','high','urgent')
        AND status NOT IN ('completed','cancelled','closed')
        ORDER BY created_at ASC LIMIT 10
    """)
    overdue_pm = _q("""
        SELECT id, title, next_due_date, asset_node_id
        FROM maintenance_plans WHERE hotel_id=:h
        AND next_due_date::DATE < CURRENT_DATE AND status != 'completed'
        ORDER BY next_due_date ASC LIMIT 10
    """)
    top_recs = _q("""
        SELECT id, recommendation, risk_level, director, created_at
        FROM recommendations WHERE hotel_id=:h AND status='pending'
        ORDER BY CASE risk_level WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END,
        created_at DESC LIMIT 5
    """)
    aging = _s("""
        SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h
        AND technician_id IS NULL
        AND status NOT IN ('completed','cancelled','closed','done','resolved')
        AND created_at < NOW() - INTERVAL '48 hours'
    """)
    total_critical = _s("""
        SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h
        AND priority IN ('critical','emergency','high','urgent')
        AND status NOT IN ('completed','cancelled','closed')
    """)
    total_overdue_pm = _s("""
        SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h
        AND next_due_date::DATE < CURRENT_DATE AND status != 'completed'
    """)
    total_pending_recs = _s("""
        SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h AND status='pending'
    """)

    def _to_dict(row):
        if hasattr(row, "_mapping"):
            return {k: str(v) if hasattr(v, "isoformat") else v
                    for k, v in dict(row._mapping).items()}
        return {}

    score = min(100, int(total_critical * 10 + total_overdue_pm * 5 + aging * 3))
    urgency = ("CRITICAL" if score >= 50 else "HIGH" if score >= 20
               else "MEDIUM" if score >= 5 else "LOW")

    return {
        "hotel_id": H,
        "generated_at": _dt.utcnow().isoformat(),
        "attention_required": score > 0,
        "urgency": urgency,
        "attention_score": score,
        "summary": {
            "critical_open_wos": total_critical,
            "overdue_pm_plans": total_overdue_pm,
            "pending_recommendations": total_pending_recs,
            "aging_unassigned_wos": int(aging),
        },
        "critical_work_orders": [_to_dict(r) for r in critical_wos],
        "overdue_pm_plans": [_to_dict(r) for r in overdue_pm],
        "top_recommendations": [_to_dict(r) for r in top_recs],
        "_meta": {"version": "v8-s05", "refresh_interval_seconds": 300},
    }


@router.get("/priorities", summary="V10-009: Operational priorities P0-P3")
def get_attention_priorities(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    from sqlalchemy import text as _t
    import datetime as _dt

    def qc(sql, p=None):
        return db.execute(_t(sql), p or {}).scalar() or 0

    crit_unassigned = qc(
        "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h"
        " AND priority='critical' AND status='open' AND technician_id IS NULL",
        {"h": hotel_id}
    )
    crit_total = qc(
        "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h"
        " AND priority='critical' AND status NOT IN ('completed','cancelled')",
        {"h": hotel_id}
    )
    high_unassigned = qc(
        "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h"
        " AND priority='high' AND status='open' AND technician_id IS NULL",
        {"h": hotel_id}
    )
    overdue_pm = qc(
        "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h"
        " AND status='active' AND next_due_date < CURRENT_DATE",
        {"h": hotel_id}
    )
    pm_this_week = qc(
        "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h"
        " AND status='active' AND next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7",
        {"h": hotel_id}
    )
    pending_recs = qc(
        "SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h AND status='pending'",
        {"h": hotel_id}
    )
    critical_recs = qc(
        "SELECT COUNT(*) FROM recommendations WHERE hotel_id=:h"
        " AND status='pending' AND risk_level='CRITICAL'",
        {"h": hotel_id}
    )

    highest = ("P0" if crit_unassigned > 0 else
               "P1" if high_unassigned > 0 else
               "P2" if overdue_pm > 0 else "P3")

    return {
        "hotel_id": hotel_id,
        "generated_at": _dt.datetime.utcnow().isoformat(),
        "p0_immediate": {
            "label": "IMMEDIATE ACTION REQUIRED",
            "count": int(crit_unassigned),
            "requires_action": crit_unassigned > 0,
            "items": [{"type": "critical_unassigned_wo", "count": int(crit_unassigned),
                        "message": f"{crit_unassigned} critical WOs have no technician",
                        "action": "Assign technician immediately",
                        "link": "/operations/work-orders?priority=critical"}]
            if crit_unassigned > 0 else []
        },
        "p1_today": {
            "label": "ACTION NEEDED TODAY",
            "count": int(high_unassigned),
            "requires_action": high_unassigned > 0,
            "items": [{"type": "high_unassigned_wo", "count": int(high_unassigned),
                        "message": f"{high_unassigned} high-priority WOs unassigned",
                        "action": "Assign technicians",
                        "link": "/operations/work-orders?priority=high"}]
        },
        "p2_this_week": {
            "label": "COMPLETE THIS WEEK",
            "count": int(overdue_pm + pm_this_week),
            "requires_action": overdue_pm > 0,
            "items": [
                {"type": "overdue_pm", "count": int(overdue_pm),
                 "message": f"{overdue_pm} PM plans overdue",
                 "action": "Schedule maintenance",
                 "link": "/operations/maintenance"},
                {"type": "pm_due_this_week", "count": int(pm_this_week),
                 "message": f"{pm_this_week} PM plans due this week",
                 "action": "Plan ahead",
                 "link": "/operations/maintenance"},
            ]
        },
        "p3_monitor": {
            "label": "MONITOR",
            "count": int(pending_recs),
            "requires_action": critical_recs > 0,
            "items": [{"type": "pending_ai", "count": int(pending_recs),
                        "critical_count": int(critical_recs),
                        "message": f"{pending_recs} AI recs pending ({critical_recs} CRITICAL)",
                        "action": "Review recommendations",
                        "link": "/attention"}]
        },
        "summary": {
            "highest_priority": highest,
            "total_action_items": int(crit_unassigned + high_unassigned),
            "critical_wo_total": int(crit_total),
        }
    }
