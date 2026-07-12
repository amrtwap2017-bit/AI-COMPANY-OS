from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.invoices.schemas import InvoiceCreate, InvoiceUpdate, InvoiceResponse
from src.commercial.invoices.repository import InvoiceRepository

router = APIRouter()

@router.post("/", response_model=InvoiceResponse, status_code=201)
def create_invoice(
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    invoice_data = payload.dict()
    invoice_data["hotel_id"] = hotel_id
    return InvoiceRepository(db).create_invoice(invoice_data)

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    invoice = InvoiceRepository(db).get_invoice(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail='Invoice not found')
    return invoice

@router.put("/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: str,
    payload: InvoiceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    invoice_data = payload.dict(exclude_unset=True)
    return InvoiceRepository(db).update_invoice(invoice_id, invoice_data)

@router.delete("/{invoice_id}", status_code=204)
def delete_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    if not InvoiceRepository(db).delete_invoice(invoice_id):
        raise HTTPException(status_code=404, detail='Invoice not found')
