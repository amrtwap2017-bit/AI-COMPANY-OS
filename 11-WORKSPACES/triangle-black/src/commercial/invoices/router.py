"""
Invoices router — Triangle Black
GET    /invoices/                  → list all invoices
GET    /invoices/{id}              → get one invoice
PATCH  /invoices/{id}              → update status/paid_date/notes
POST   /invoices/{id}/mark-paid    → mark invoice as paid
POST   /invoices/{id}/send         → mark invoice as sent
"""
from __future__ import annotations
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.core.auth import require_agent, require_manager
from src.commercial.auth.models import User
from src.commercial.invoices.models import Invoice
from src.commercial.invoices.repository import InvoiceRepository
from src.commercial.invoices.schemas import InvoiceResponse, InvoiceUpdate

router = APIRouter(prefix="/invoices", tags=["invoices"])


class MarkPaidIn(BaseModel):
    paid_date: Optional[datetime] = None
    notes: Optional[str] = None


@router.get("/", response_model=List[InvoiceResponse])
def list_invoices(
    skip: int = 0,
    limit: int = 100,
    status: str = "",
    contract_id: str = "",
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
):
    return InvoiceRepository(db).list(
        skip=skip,
        limit=limit,
        status=status or None,
        contract_id=contract_id or None,
    )


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
):
    inv = InvoiceRepository(db).get(invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return inv


@router.patch("/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: str,
    payload: InvoiceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    inv = InvoiceRepository(db).update(
        invoice_id, payload.model_dump(exclude_none=True)
    )
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return inv


@router.post("/{invoice_id}/mark-paid", response_model=InvoiceResponse)
def mark_paid(
    invoice_id: str,
    payload: MarkPaidIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    repo = InvoiceRepository(db)
    inv = repo.get(invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if inv.status == "paid":
        raise HTTPException(status_code=400, detail="Invoice already paid")

    updated = repo.update(invoice_id, {
        "status": "paid",
        "paid_date": payload.paid_date or datetime.utcnow(),
        "notes": payload.notes,
    })
    return updated


@router.post("/{invoice_id}/send", response_model=InvoiceResponse)
def send_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    repo = InvoiceRepository(db)
    inv = repo.get(invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if inv.status not in ("draft",):
        raise HTTPException(
            status_code=400,
            detail=f"Invoice is '{inv.status}', must be 'draft' to send"
        )
    updated = repo.update(invoice_id, {"status": "sent"})
    return updated
