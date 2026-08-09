"""
eta_invoicing/repository.py — Sprint-080: DDD completion
Data access layer for ETA e-invoicing.
RULE: Always filter by hotel_id — non-negotiable.
"""
from sqlalchemy.orm import Session
from typing import Optional, List
import uuid
from datetime import datetime, timezone


def get_all(
    db: Session,
    hotel_id: str,
    skip: int = 0,
    limit: int = 100,
) -> List:
    """List all ETA invoices for a hotel."""
    from src.commercial.eta_invoicing.models import ETAInvoice
    return (
        db.query(ETAInvoice)
        .filter(
            ETAInvoice.hotel_id == hotel_id,
            ETAInvoice.is_active == True  # noqa: E712
        )
        .order_by(ETAInvoice.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_by_id(
    db: Session,
    invoice_id: str,
    hotel_id: str,
) -> Optional[object]:
    """Get a single ETA invoice by ID."""
    from src.commercial.eta_invoicing.models import ETAInvoice
    return (
        db.query(ETAInvoice)
        .filter(
            ETAInvoice.id == invoice_id,
            ETAInvoice.hotel_id == hotel_id
        )
        .first()
    )


def get_by_invoice_number(
    db: Session,
    invoice_number: str,
    hotel_id: str,
) -> Optional[object]:
    """Get ETA invoice by invoice number."""
    from src.commercial.eta_invoicing.models import ETAInvoice
    return (
        db.query(ETAInvoice)
        .filter(
            ETAInvoice.invoice_number == invoice_number,
            ETAInvoice.hotel_id == hotel_id
        )
        .first()
    )


def create(
    db: Session,
    hotel_id: str,
    invoice_id: str,
    invoice_number: str,
    total_amount: float,
    tax_amount: float,
    buyer_name: str,
    buyer_tax_id: Optional[str],
    eta_status: str,
    eta_uuid: Optional[str] = None,
    raw_payload: Optional[dict] = None,
    eta_response: Optional[dict] = None,
    error_message: Optional[str] = None,
) -> object:
    """Create a new ETA invoice record."""
    from src.commercial.eta_invoicing.models import ETAInvoice
    now = datetime.utcnow()
    record = ETAInvoice(
        id=str(uuid.uuid4()),
        hotel_id=hotel_id,
        invoice_id=invoice_id,
        invoice_number=invoice_number,
        total_amount=total_amount,
        tax_amount=tax_amount,
        buyer_name=buyer_name,
        buyer_tax_id=buyer_tax_id,
        eta_status=eta_status,
        submission_date=now if eta_status == "submitted" else None,
        eta_uuid=eta_uuid,
        raw_payload=raw_payload,
        eta_response=eta_response,
        error_message=error_message,
        created_at=now,
        updated_at=now,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def update_status(
    db: Session,
    invoice_id: str,
    hotel_id: str,
    eta_status: str,
    eta_uuid: Optional[str] = None,
    error_message: Optional[str] = None,
) -> Optional[object]:
    """Update ETA status on an invoice."""
    from src.commercial.eta_invoicing.models import ETAInvoice
    obj = get_by_id(db, invoice_id, hotel_id)
    if not obj:
        return None
    obj.eta_status = eta_status
    if eta_uuid:
        obj.eta_uuid = eta_uuid
    if error_message is not None:
        obj.error_message = error_message
    obj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(obj)
    return obj


def count(
    db: Session,
    hotel_id: str,
    eta_status: Optional[str] = None,
) -> int:
    """Count ETA invoices, optionally filtered by status."""
    from src.commercial.eta_invoicing.models import ETAInvoice
    q = db.query(ETAInvoice).filter(
        ETAInvoice.hotel_id == hotel_id,
        ETAInvoice.is_active == True  # noqa: E712
    )
    if eta_status:
        q = q.filter(ETAInvoice.eta_status == eta_status)
    return q.count()


# Singleton-style repository instance
class ETAInvoiceRepository:
    def get_all(self, db, hotel_id, skip=0, limit=100):
        return get_all(db, hotel_id, skip, limit)

    def get_by_id(self, db, invoice_id, hotel_id):
        return get_by_id(db, invoice_id, hotel_id)

    def create(self, db, **kwargs):
        return create(db, **kwargs)

    def update_status(self, db, invoice_id, hotel_id, eta_status, **kwargs):
        return update_status(db, invoice_id, hotel_id, eta_status, **kwargs)

    def count(self, db, hotel_id, eta_status=None):
        return count(db, hotel_id, eta_status)


eta_invoice_repo = ETAInvoiceRepository()
