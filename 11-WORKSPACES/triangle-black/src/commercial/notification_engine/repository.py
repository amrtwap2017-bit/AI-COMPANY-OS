"""
notification_engine/repository.py — Sprint-070
RULE: Always filter by hotel_id — non-negotiable
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
import uuid
from datetime import datetime, timezone


def get_live_notifications(
    db: Session,
    hotel_id: str,
    user_id: Optional[str] = None,
    limit: int = 50,
) -> List[dict]:
    """Get live notifications for a hotel, optionally filtered by user."""
    where = "WHERE hotel_id=:hotel_id"
    params = {"hotel_id": hotel_id, "limit": limit}
    if user_id:
        where += " AND (user_id=:user_id OR user_id IS NULL)"
        params["user_id"] = user_id
    rows = db.execute(text(f"""
        SELECT * FROM platform_notifications {where}
        ORDER BY created_at DESC LIMIT :limit
    """), params).fetchall()
    return [dict(r._mapping) for r in rows]


def mark_as_read(
    db: Session,
    notification_id: str,
    hotel_id: str,
) -> bool:
    """Mark a notification as read. Returns True if found."""
    result = db.execute(text("""
        UPDATE platform_notifications
        SET is_read = TRUE
        WHERE id=:id AND hotel_id=:hotel_id
    """), {"id": notification_id, "hotel_id": hotel_id})
    db.commit()
    return result.rowcount > 0


def get_unread_count(
    db: Session,
    hotel_id: str,
    user_id: Optional[str] = None,
) -> int:
    """Get count of unread notifications."""
    where = "WHERE hotel_id=:hotel_id AND is_read=FALSE"
    params = {"hotel_id": hotel_id}
    if user_id:
        where += " AND (user_id=:user_id OR user_id IS NULL)"
        params["user_id"] = user_id
    result = db.execute(text(f"""
        SELECT COUNT(*) FROM platform_notifications {where}
    """), params).scalar()
    return result or 0


def create_notification(
    db: Session,
    hotel_id: str,
    notif_type: str,
    title: str,
    message: Optional[str] = None,
    user_id: Optional[str] = None,
    priority: str = "medium",
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    action_url: Optional[str] = None,
) -> str:
    """Create a new notification. Returns new ID."""
    nid = str(uuid.uuid4())
    db.execute(text("""
        INSERT INTO platform_notifications
        (id, hotel_id, user_id, type, title, message, priority,
         is_read, entity_type, entity_id, action_url, created_at)
        VALUES
        (:id, :hotel_id, :user_id, :type, :title, :message, :priority,
         FALSE, :entity_type, :entity_id, :action_url, :created_at)
    """), {
        "id": nid, "hotel_id": hotel_id, "user_id": user_id,
        "type": notif_type, "title": title, "message": message,
        "priority": priority, "entity_type": entity_type,
        "entity_id": entity_id, "action_url": action_url,
        "created_at": datetime.now(timezone.utc).replace(tzinfo=None),
    })
    db.commit()
    return nid
