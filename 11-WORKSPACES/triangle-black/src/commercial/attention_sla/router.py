"""Attention SLA Router — V15 P1 — SLA event history and analysis."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user  # ALWAYS import — lesson learned

router = APIRouter(prefix="/attention/sla", tags=["attention_sla"])


@router.post("/event", summary="Record SLA transition event")
def record_sla_event(
    payload: dict,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Record a detected/acknowledged/assigned/resolved timestamp."""
    from src.commercial.attention_sla.service import AttentionSLAService
    svc = AttentionSLAService(db=db, hotel_id=hotel_id)
    actor = getattr(current_user, "email", str(current_user))
    return svc.record_event(
        event_type=payload.get("event_type", "DETECTED"),
        priority=payload.get("priority", "P2"),
        attention_id=payload.get("attention_id"),
        work_order_id=payload.get("work_order_id"),
        actor=actor,
        notes=payload.get("notes", ""),
    )


@router.get("/summary", summary="SLA performance summary")
def get_sla_summary(
    days: int = 30,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    SLA performance: avg response time by priority.
    This is the pilot KPI: 'Did P0 response improve vs baseline?'
    """
    from src.commercial.attention_sla.service import AttentionSLAService
    svc = AttentionSLAService(db=db, hotel_id=hotel_id)
    return svc.get_sla_summary(days=days)


@router.get("/history", summary="Recent SLA events")
def get_sla_history(
    limit: int = 50,
    priority: str = None,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """List recent SLA events for this hotel."""
    from sqlalchemy import text
    where = "WHERE hotel_id = :h"
    params = {"h": hotel_id}
    if priority:
        where += " AND priority = :priority"
        params["priority"] = priority.upper()

    rows = db.execute(text(f"""
        SELECT * FROM attention_sla_events
        {where}
        ORDER BY occurred_at DESC
        LIMIT :limit
    """), {**params, "limit": limit}).fetchall()

    return {
        "hotel_id": hotel_id,
        "count": len(rows),
        "events": [dict(r._mapping) for r in rows],
    }
