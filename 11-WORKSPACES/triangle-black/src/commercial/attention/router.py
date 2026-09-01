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
    def _q(sql, params=None):
        try:
            return db.execute(text(sql), params or {"h": H}).fetchall()
        except Exception:
            return []
    def _s(sql, params=None):
        try:
            return db.execute(text(sql), params or {"h": H}).scalar() or 0
        except Exception:
            return 0

    critical_wos = _q("""
        SELECT id, title, priority, status, asset_id, created_at
        FROM work_orders WHERE hotel_id=:h
        AND priority IN ('critical','emergency')
        AND status NOT IN ('completed','cancelled','closed')
        ORDER BY created_at ASC LIMIT 10
    """)
    overdue_pm = _q("""
        SELECT id, name, next_due_date, asset_node_id
        FROM maintenance_plans WHERE hotel_id=:h
        AND next_due_date::DATE < CURRENT_DATE AND status != 'completed'
        ORDER BY next_due_date ASC LIMIT 10
    """)
    top_recs = _q("""
        SELECT id, title, priority, recommendation_type, created_at
        FROM recommendations WHERE hotel_id=:h AND status='pending'
        ORDER BY CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END,
        created_at DESC LIMIT 5
    """)
    aging = _s("""
        SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h
        AND technician_id IS NULL
        AND status NOT IN ('completed','cancelled','closed')
        AND created_at < NOW() - INTERVAL '48 hours'
    """)
    total_critical = _s("""
        SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h
        AND priority IN ('critical','emergency')
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
