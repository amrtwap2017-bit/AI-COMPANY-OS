"""
Application Service for Invoices Domain (Sprint U-003)
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from src.commercial.invoices.repository import InvoiceRepository
from src.core.events import emit_event, EventType
from src.core.audit import audit_create, audit_update, audit_action

class InvoiceService:
    def __init__(self, db: Session, hotel_id: str, actor: Optional[str] = None):
        self.db = db
        self.hotel_id = hotel_id
        self.actor = actor or "system"
        self.repo = InvoiceRepository(db)

    def get_invoice(self, invoice_id: str) -> Optional[Dict[str, Any]]:
        inv = self.repo.get_by_id(invoice_id, self.hotel_id)
        return getattr(inv, "to_dict", lambda: dict(inv.__dict__))() if inv else None

    def list_invoices(self, status: Optional[str] = None, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        return self.repo.list_invoices(hotel_id=self.hotel_id, status=status, limit=limit, skip=skip)

    def create_invoice(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        payload["hotel_id"] = self.hotel_id
        inv = self.repo.create(payload)
        inv_id = str(getattr(inv, "id", ""))

        try:
            audit_create(self.db, "invoice", inv_id, self.actor, self.hotel_id)
            emit_event(
                db=self.db,
                hotel_id=self.hotel_id,
                event_type=EventType.INVOICE_CREATED,
                aggregate_type="invoice",
                aggregate_id=inv_id,
                payload={"invoice_number": payload.get("invoice_number"), "amount": payload.get("total_amount")},
                actor=self.actor,
            )
        except Exception:
            pass

        return getattr(inv, "to_dict", lambda: dict(inv.__dict__))()

    def mark_as_paid(self, invoice_id: str) -> Optional[Dict[str, Any]]:
        updated = self.repo.update(invoice_id, self.hotel_id, {
            "status": "paid",
            "paid_date": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        if updated:
            try:
                audit_action(self.db, "invoice", invoice_id, "PAID", self.actor)
                emit_event(
                    db=self.db,
                    hotel_id=self.hotel_id,
                    event_type=EventType.INVOICE_PAID,
                    aggregate_type="invoice",
                    aggregate_id=invoice_id,
                    payload={"status": "paid"},
                    actor=self.actor,
                )
            except Exception:
                pass
        return getattr(updated, "to_dict", lambda: dict(updated.__dict__))() if updated else None
