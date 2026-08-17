"""
Event Outbox — T-006
Reliable async event feed for AI, Digital Twin, notifications and analytics.
Every important domain transaction writes to platform_events.
EventDispatcher reads pending events and delivers to consumers.
Graph failures and dispatch failures NEVER block the source transaction.
"""
from __future__ import annotations
import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text


# ── Event type constants ────────────────────────────────────────────────────

class EventType:
    # Work Order lifecycle
    WO_CREATED          = "work_order.created"
    WO_ASSIGNED         = "work_order.assigned"
    WO_STARTED          = "work_order.started"
    WO_COMPLETED        = "work_order.completed"
    WO_CLOSED           = "work_order.closed"
    WO_SLA_BREACHED     = "work_order.sla_breached"

    # Service Request lifecycle
    SR_CREATED          = "service_request.created"
    SR_CONVERTED        = "service_request.converted_to_wo"
    SR_RESOLVED         = "service_request.resolved"
    SR_CLOSED           = "service_request.closed"

    # Asset lifecycle
    ASSET_CREATED       = "asset.created"
    ASSET_UPDATED       = "asset.updated"
    ASSET_FAILURE       = "asset.failure_detected"

    # Procurement lifecycle
    PO_CREATED          = "purchase_order.created"
    PO_APPROVED         = "purchase_order.approved"
    GR_CREATED          = "goods_receipt.created"

    # Finance
    INVOICE_CREATED     = "invoice.created"
    INVOICE_PAID        = "invoice.paid"

    # Supplier
    SUPPLIER_CREATED    = "supplier.created"
    SUPPLIER_RATED      = "supplier.rated"


# ── Outbox writer ───────────────────────────────────────────────────────────

class EventOutbox:
    """
    Writes domain events to the platform_events outbox table.
    Called from routers and application services after successful DB commits.
    Always non-blocking — any failure is swallowed to protect the transaction.
    """

    def __init__(self, db: Session, hotel_id: str, actor: Optional[str] = None):
        self.db = db
        self.hotel_id = hotel_id
        self.actor = actor or "system"

    def publish(
        self,
        event_type: str,
        aggregate_type: str,
        aggregate_id: str,
        payload: Optional[Dict[str, Any]] = None,
        correlation_id: Optional[str] = None,
    ) -> Optional[str]:
        """
        Write one event to the outbox.
        Returns event_id on success, None on failure.
        NEVER raises — outbox failure must not break the business transaction.
        """
        try:
            event_id = str(uuid.uuid4())
            self.db.execute(text(
                """INSERT INTO platform_events
                   (id, hotel_id, event_type, aggregate_type, aggregate_id,
                    payload, actor, status, created_at, correlation_id)
                   VALUES
                   (:id, :hid, :et, :at, :aid,
                    :payload, :actor, 'pending', :now, :corr)"""
            ), {
                "id": event_id,
                "hid": self.hotel_id,
                "et": event_type,
                "at": aggregate_type,
                "aid": aggregate_id,
                "payload": json.dumps(payload or {}),
                "actor": self.actor,
                "now": datetime.utcnow(),
                "corr": correlation_id or str(uuid.uuid4()),
            })
            self.db.commit()
            return event_id
        except Exception:
            # Outbox write failure is never fatal
            try:
                self.db.rollback()
            except Exception:
                pass
            return None

    def publish_many(self, events: List[Dict[str, Any]]) -> int:
        """
        Write multiple events. Returns count of successful writes.
        """
        count = 0
        for evt in events:
            result = self.publish(
                event_type=evt.get("event_type", "unknown"),
                aggregate_type=evt.get("aggregate_type", "unknown"),
                aggregate_id=evt.get("aggregate_id", ""),
                payload=evt.get("payload"),
                correlation_id=evt.get("correlation_id"),
            )
            if result:
                count += 1
        return count


# ── Dispatcher ──────────────────────────────────────────────────────────────

class EventDispatcher:
    """
    Reads pending events from the outbox and delivers to consumers.
    Consumers: notifications, AI signals, digital twin, analytics.
    Non-blocking — consumer failures are logged but do not block dispatch.
    """

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def get_pending(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch pending events for this hotel."""
        try:
            rows = self.db.execute(text(
                """SELECT id, hotel_id, event_type, aggregate_type,
                          aggregate_id, payload, actor, status,
                          created_at, correlation_id
                   FROM platform_events
                   WHERE hotel_id = :hid AND status = 'pending'
                   ORDER BY created_at ASC
                   LIMIT :lim"""
            ), {"hid": self.hotel_id, "lim": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception:
            return []

    def mark_dispatched(self, event_id: str) -> None:
        """Mark event as dispatched after successful delivery."""
        try:
            self.db.execute(text(
                """UPDATE platform_events
                   SET status = 'dispatched', dispatched_at = :now
                   WHERE id = :id AND hotel_id = :hid"""
            ), {"now": datetime.utcnow(), "id": event_id, "hid": self.hotel_id})
            self.db.commit()
        except Exception:
            pass

    def mark_failed(self, event_id: str) -> None:
        """Mark event as failed after delivery error."""
        try:
            self.db.execute(text(
                """UPDATE platform_events
                   SET status = 'failed'
                   WHERE id = :id AND hotel_id = :hid"""
            ), {"id": event_id, "hid": self.hotel_id})
            self.db.commit()
        except Exception:
            pass

    def get_stats(self) -> Dict[str, Any]:
        """Outbox statistics for this hotel."""
        try:
            row = self.db.execute(text(
                """SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending,
                    SUM(CASE WHEN status='dispatched' THEN 1 ELSE 0 END) AS dispatched,
                    SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS failed
                   FROM platform_events
                   WHERE hotel_id = :hid"""
            ), {"hid": self.hotel_id}).fetchone()
            d = dict(row._mapping) if row else {}
            return {
                "hotel_id": self.hotel_id,
                "total": int(d.get("total") or 0),
                "pending": int(d.get("pending") or 0),
                "dispatched": int(d.get("dispatched") or 0),
                "failed": int(d.get("failed") or 0),
            }
        except Exception as e:
            return {"hotel_id": self.hotel_id, "error": str(e)}


# ── Convenience function ────────────────────────────────────────────────────

def emit_event(
    db: Session,
    hotel_id: str,
    event_type: str,
    aggregate_type: str,
    aggregate_id: str,
    payload: Optional[Dict[str, Any]] = None,
    actor: Optional[str] = None,
    correlation_id: Optional[str] = None,
) -> Optional[str]:
    """
    Top-level convenience function for emitting a single event.
    Safe to call from any router or service.
    Returns event_id or None on failure.
    """
    outbox = EventOutbox(db=db, hotel_id=hotel_id, actor=actor)
    return outbox.publish(
        event_type=event_type,
        aggregate_type=aggregate_type,
        aggregate_id=aggregate_id,
        payload=payload,
        correlation_id=correlation_id,
    )
