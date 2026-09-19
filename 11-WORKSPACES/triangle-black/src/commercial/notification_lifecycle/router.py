"""
Notification Lifecycle Router — V15.0
Tracks: CREATED → QUEUED → SENT → DELIVERED → READ
        FAILED → RETRY → PERMANENT_FAILURE
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user

router = APIRouter(prefix="/notifications/lifecycle", tags=["notification_lifecycle"])


@router.get("/summary", summary="Notification delivery summary")
def get_delivery_summary(
    days: int = 7,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Delivery rate: what % of notifications actually reached users?"""
    rows = db.execute(text("""
        SELECT
            COALESCE(delivery_status, 'unknown') as delivery_status,
            COALESCE(channel, 'in_app') as channel,
            COUNT(*) as count
        FROM notifications
        WHERE hotel_id = :h
        AND created_at >= NOW() - (:days * INTERVAL '1 day')
        GROUP BY delivery_status, channel
        ORDER BY count DESC
    """), {"h": hotel_id, "days": days}).fetchall()

    summary = {}
    for row in rows:
        d = dict(row._mapping)
        key = f"{d['channel']}:{d['delivery_status']}"
        summary[key] = int(d["count"])

    total = sum(summary.values())
    delivered = sum(v for k, v in summary.items()
                    if "delivered" in k or ":read" in k)
    delivery_rate = round(delivered / max(total, 1) * 100, 1)

    return {
        "hotel_id": hotel_id,
        "period_days": days,
        "total": total,
        "delivered_or_read": delivered,
        "delivery_rate_pct": delivery_rate,
        "by_status": summary,
        "generated_at": datetime.utcnow().isoformat(),
    }


@router.post("/mark-delivered/{notification_id}", summary="Mark delivered")
def mark_delivered(
    notification_id: str,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    result = db.execute(text("""
        UPDATE notifications
        SET delivery_status = 'delivered', delivered_at = :now
        WHERE id = :id AND hotel_id = :h
        AND COALESCE(delivery_status, 'created') IN ('sent','queued','created')
        RETURNING id
    """), {"id": notification_id, "h": hotel_id, "now": now}).fetchone()
    if not result:
        raise HTTPException(404, "Not found or already in terminal state")
    db.commit()
    return {"success": True, "status": "delivered", "delivered_at": now.isoformat()}


@router.post("/mark-read/{notification_id}", summary="Mark read")
def mark_read(
    notification_id: str,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    result = db.execute(text("""
        UPDATE notifications
        SET delivery_status = 'read', read_at = :now
        WHERE id = :id AND hotel_id = :h
        RETURNING id
    """), {"id": notification_id, "h": hotel_id, "now": now}).fetchone()
    if not result:
        raise HTTPException(404, "Notification not found")
    db.commit()
    return {"success": True, "status": "read", "read_at": now.isoformat()}


@router.get("/failed", summary="List failed notifications")
def list_failed(
    limit: int = 20,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    rows = db.execute(text("""
        SELECT id, title, channel, delivery_status, retry_count,
               delivery_error, created_at, failed_at
        FROM notifications
        WHERE hotel_id = :h
        AND delivery_status IN ('failed', 'permanent_failure')
        ORDER BY created_at DESC
        LIMIT :limit
    """), {"h": hotel_id, "limit": limit}).fetchall()
    return {
        "hotel_id": hotel_id,
        "count": len(rows),
        "failed_notifications": [dict(r._mapping) for r in rows],
    }
