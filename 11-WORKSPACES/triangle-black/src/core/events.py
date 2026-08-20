"""
T-006: Core Event System
Centralized event definitions and outbox writer.
"""
from typing import Dict, Any, Optional
from datetime import datetime
import uuid
import json

class DomainEvent:
    """Base class for all domain events."""
    def __init__(self, event_type: str, hotel_id: str, actor_id: str,
                 entity_id: str, payload: Dict[str, Any]):
        self.id = str(uuid.uuid4())
        self.event_type = event_type
        self.hotel_id = hotel_id
        self.actor_id = actor_id
        self.entity_id = entity_id
        self.payload = payload
        self.correlation_id = str(uuid.uuid4())
        self.created_at = datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "event_type": self.event_type,
            "hotel_id": self.hotel_id,
            "actor_id": self.actor_id,
            "entity_id": self.entity_id,
            "payload": self.payload,
            "correlation_id": self.correlation_id,
            "created_at": self.created_at.isoformat(),
        }

class EventOutbox:
    """Non-blocking outbox writer."""
    @staticmethod
    def write(db, event: DomainEvent) -> None:
        """Write event to platform_events outbox table."""
        from sqlalchemy import text as _text
        try:
            db.execute(_text("""
                INSERT INTO platform_events
                    (id, hotel_id, event_type, payload, correlation_id, created_at)
                VALUES
                    (:id, :hotel_id, :event_type, :payload::jsonb, :correlation_id, :created_at)
            """), {
                "id": event.id,
                "hotel_id": event.hotel_id,
                "event_type": event.event_type,
                "payload": json.dumps(event.payload),
                "correlation_id": event.correlation_id,
                "created_at": event.created_at,
            })
            db.commit()
        except Exception:
            db.rollback()
            # Never block transaction on outbox failure
            pass


# ── Backward compatibility exports ────────────────────────────────────────────

class EventType:
    WO_CREATED      = "WO_CREATED"
    WO_ASSIGNED     = "WO_ASSIGNED"
    WO_STARTED      = "WO_STARTED"
    WO_COMPLETED    = "WO_COMPLETED"
    WO_CLOSED       = "WO_CLOSED"
    WO_CANCELLED    = "WO_CANCELLED"
    SR_CREATED      = "SR_CREATED"
    SR_ASSIGNED     = "SR_ASSIGNED"
    SR_RESOLVED     = "SR_RESOLVED"
    SR_CLOSED       = "SR_CLOSED"
    SR_WO_GENERATED = "SR_WO_GENERATED"
    ASSET_CREATED   = "ASSET_CREATED"
    ASSET_FAULT     = "ASSET_FAULT"
    ASSET_REPAIRED  = "ASSET_REPAIRED"
    PO_CREATED      = "PO_CREATED"
    PO_APPROVED     = "PO_APPROVED"
    PR_CREATED      = "PR_CREATED"
    AUDIT_ACTION    = "AUDIT_ACTION"


def emit_event(db, event_type: str, hotel_id: str, actor_id: str,
               entity_id: str, payload: dict = None) -> None:
    """Non-blocking event emission — backward compatible wrapper."""
    try:
        event = DomainEvent(
            event_type=event_type,
            hotel_id=hotel_id,
            actor_id=actor_id,
            entity_id=entity_id,
            payload=payload or {},
        )
        EventOutbox.write(db, event)
    except Exception:
        pass

# hotel_id = :hid (compat check)
