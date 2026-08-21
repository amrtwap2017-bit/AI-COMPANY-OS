"""
Application Service for Purchase Orders Domain (Sprint U-003)
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.events import emit_event, EventType
from src.core.audit import audit_create, audit_update, audit_action

class PurchaseOrderService:
    def __init__(self, db: Session, hotel_id: str, actor: Optional[str] = None):
        self.db = db
        self.hotel_id = hotel_id
        self.actor = actor or "system"

    def get_by_id(self, po_id: str) -> Optional[Dict[str, Any]]:
        row = self.db.execute(text("""
            SELECT * FROM purchase_orders
            WHERE id = :id AND hotel_id = :hid
            LIMIT 1
        """), {"id": po_id, "hid": self.hotel_id}).fetchone()
        return dict(row._mapping) if row else None

    def list_orders(self, status: Optional[str] = None, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        query = "SELECT * FROM purchase_orders WHERE hotel_id = :hid"
        params = {"hid": self.hotel_id, "lim": limit, "sk": skip}
        if status:
            query += " AND status = :status"
            params["status"] = status
        query += " ORDER BY created_at DESC LIMIT :lim OFFSET :sk"
        rows = self.db.execute(text(query), params).fetchall()
        return [dict(r._mapping) for r in rows]

    def approve_order(self, po_id: str) -> bool:
        order = self.get_by_id(po_id)
        if not order:
            return False
        self.db.execute(text("""
            UPDATE purchase_orders
            SET status = 'approved', updated_at = NOW()
            WHERE id = :id AND hotel_id = :hid
        """), {"id": po_id, "hid": self.hotel_id})
        self.db.commit()

        try:
            audit_action(self.db, "purchase_order", po_id, "APPROVED", self.actor)
            emit_event(
                db=self.db,
                hotel_id=self.hotel_id,
                event_type=EventType.PO_APPROVED,
                aggregate_type="purchase_order",
                aggregate_id=po_id,
                payload={"status": "approved", "total_amount": float(order.get("total_amount") or 0.0)},
                actor=self.actor,
            )
        except Exception:
            pass
        return True
