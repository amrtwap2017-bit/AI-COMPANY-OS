"""
audit_log/repository.py — Sprint-070: Data access layer
RULE: Always filter by hotel_id when available
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
import uuid
from datetime import datetime, timezone


def record_audit_event(
    db: Session,
    entity_type: str,
    action: str,
    hotel_id: Optional[str] = None,
    entity_id: Optional[str] = None,
    actor_id: Optional[str] = None,
    actor_name: Optional[str] = None,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    ip_address: Optional[str] = None,
    metadata: Optional[str] = None,
) -> str:
    """Record a single audit event. Returns the new event ID."""
    event_id = str(uuid.uuid4())
    db.execute(text("""
        INSERT INTO platform_audit_log
        (id, entity_type, entity_id, action, actor_id, actor_name,
         old_value, new_value, ip_address, hotel_id, metadata, created_at)
        VALUES
        (:id, :entity_type, :entity_id, :action, :actor_id, :actor_name,
         :old_value, :new_value, :ip_address, :hotel_id, :metadata, :created_at)
    """), {
        "id": event_id,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "action": action,
        "actor_id": actor_id,
        "actor_name": actor_name,
        "old_value": old_value,
        "new_value": new_value,
        "ip_address": ip_address,
        "hotel_id": hotel_id,
        "metadata": metadata,
        "created_at": datetime.now(timezone.utc).replace(tzinfo=None),
    })
    db.commit()
    return event_id


def get_entity_audit_trail(
    db: Session,
    entity_type: str,
    entity_id: str,
    hotel_id: Optional[str] = None,
    limit: int = 50,
) -> List[dict]:
    """Get audit trail for a specific entity."""
    where = "WHERE entity_type=:entity_type AND entity_id=:entity_id"
    params = {"entity_type": entity_type, "entity_id": entity_id, "limit": limit}
    if hotel_id:
        where += " AND hotel_id=:hotel_id"
        params["hotel_id"] = hotel_id
    rows = db.execute(text(f"""
        SELECT * FROM platform_audit_log {where}
        ORDER BY created_at DESC LIMIT :limit
    """), params).fetchall()
    return [dict(r._mapping) for r in rows]


def get_recent_events(
    db: Session,
    hotel_id: Optional[str] = None,
    limit: int = 50,
) -> List[dict]:
    """Get recent audit events, optionally filtered by hotel."""
    where = "WHERE hotel_id=:hotel_id" if hotel_id else ""
    params = {"limit": limit}
    if hotel_id:
        params["hotel_id"] = hotel_id
    rows = db.execute(text(f"""
        SELECT * FROM platform_audit_log {where}
        ORDER BY created_at DESC LIMIT :limit
    """), params).fetchall()
    return [dict(r._mapping) for r in rows]
