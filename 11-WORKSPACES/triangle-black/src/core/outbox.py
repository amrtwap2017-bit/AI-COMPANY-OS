"""
T-006: Outbox Dispatcher
Polls platform_events table and delivers to consumers.
Idempotent and retry-capable.
"""
from typing import List, Callable, Dict, Any
from datetime import datetime, timedelta
import time
import json

class OutboxDispatcher:
    """Dispatches events from outbox to domain consumers."""
    
    def __init__(self, db, batch_size: int = 50):
        self.db = db
        self.batch_size = batch_size
        self.consumers: Dict[str, List[Callable]] = {}

    def register_consumer(self, event_type: str, consumer: Callable):
        """Register a consumer for a specific event type."""
        if event_type not in self.consumers:
            self.consumers[event_type] = []
        self.consumers[event_type].append(consumer)

    def dispatch_batch(self) -> int:
        """Process one batch of unprocessed events."""
        from sqlalchemy import text as _text
        
        # Get unprocessed events
        events = self.db.execute(_text("""
            SELECT * FROM platform_events
            WHERE processed_at IS NULL
            ORDER BY created_at ASC
            LIMIT :batch
            FOR UPDATE SKIP LOCKED
        """), {"batch": self.batch_size}).fetchall()

        processed = 0
        for row in events:
            event = dict(row._mapping)
            try:
                self._deliver_event(event)
                self._mark_processed(event["id"])
                processed += 1
            except Exception as e:
                self._mark_failed(event["id"], str(e))
        
        return processed

    def _deliver_event(self, event: Dict[str, Any]) -> None:
        """Deliver event to all registered consumers for its type."""
        consumers = self.consumers.get(event["event_type"], [])
        for consumer in consumers:
            try:
                consumer(event)
            except Exception:
                # Consumer failure should not stop other consumers
                pass

    def _mark_processed(self, event_id: str) -> None:
        from sqlalchemy import text as _text
        self.db.execute(_text("""
            UPDATE platform_events
            SET processed_at = NOW(), processed_by = 'dispatcher'
            WHERE id = :id
        """), {"id": event_id})
        self.db.commit()

    def _mark_failed(self, event_id: str, error: str) -> None:
        from sqlalchemy import text as _text
        self.db.execute(_text("""
            UPDATE platform_events
            SET retry_count = retry_count + 1,
                last_error = :error,
                processed_at = CASE WHEN retry_count >= 5 THEN NOW() ELSE NULL END
            WHERE id = :id
        """), {"id": event_id, "error": error})
        self.db.commit()

    def run_forever(self, interval_seconds: int = 5):
        """Run dispatcher in background thread or process."""
        while True:
            try:
                count = self.dispatch_batch()
                if count > 0:
                    print(f"Outbox dispatched {count} events")
                time.sleep(interval_seconds)
            except Exception:
                time.sleep(10)  # Back off on error
