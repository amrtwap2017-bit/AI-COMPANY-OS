from src.core.auth import get_current_user
from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from datetime import datetime
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .models import ETAInvoice
from .schemas import ETAInvoiceSubmit, ETAInvoiceResponse
from .service import eta_service

router = APIRouter(prefix="/eta", tags=["eta-invoicing"])

@router.get("/status")
def eta_status():
    return {
        "configured": eta_service.is_configured(),
        "sandbox": eta_service.sandbox,
        "message": "Set ETA_CLIENT_ID and ETA_CLIENT_SECRET to enable" if not eta_service.is_configured() else "ETA configured"
    }

@router.get("/invoices", dependencies=[Depends(get_current_user)], response_model=List[ETAInvoiceResponse])
def list_invoices(hotel_id: str = Depends(get_hotel_id), skip: int = 0, limit: int = 100,
                  db: Session = Depends(get_db)):
    return db.query(ETAInvoice).filter(
        ETAInvoice.hotel_id == hotel_id, ETAInvoice.is_active == True
    ).order_by(ETAInvoice.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/submit", response_model=ETAInvoiceResponse)
async def submit_invoice(payload: ETAInvoiceSubmit, hotel_id: str = Depends(get_hotel_id),
                         db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["hotel_name"] = "Triangle Black Hotel"
    eta_payload = eta_service.build_invoice_payload(data)
    result = await eta_service.submit_invoice(eta_payload)
    
    record = ETAInvoice(
        id=str(uuid.uuid4()), hotel_id=hotel_id,
        invoice_id=payload.invoice_id,
        invoice_number=payload.invoice_number,
        total_amount=payload.total_amount,
        tax_amount=payload.tax_amount,
        buyer_name=payload.buyer_name,
        buyer_tax_id=payload.buyer_tax_id,
        eta_status="submitted" if result.get("ok") else "failed",
        submission_date=datetime.utcnow() if result.get("ok") else None,
        eta_uuid=result.get("data", {}).get("submissionId"),
        raw_payload=eta_payload,
        eta_response=result,
        error_message=result.get("error") if not result.get("ok") else None,
        created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("/invoices/{invoice_id}", response_model=ETAInvoiceResponse)
def get_invoice(invoice_id: str, hotel_id: str = Depends(get_hotel_id),
                db: Session = Depends(get_db)):
    obj = db.query(ETAInvoice).filter(
        ETAInvoice.id == invoice_id, ETAInvoice.hotel_id == hotel_id).first()
    if not obj: raise HTTPException(404, "ETA invoice not found")
    return obj
