from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class ETAInvoiceSubmit(BaseModel):
    invoice_id: Optional[str] = None
    invoice_number: str
    total_amount: float
    tax_amount: float = 0.0
    buyer_name: Optional[str] = None
    buyer_tax_id: Optional[str] = None

class ETAInvoiceResponse(BaseModel):
    id: str
    hotel_id: str
    invoice_number: str
    eta_uuid: Optional[str]
    eta_status: str
    submission_date: Optional[datetime]
    total_amount: float
    tax_amount: float
    buyer_name: Optional[str]
    error_message: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True
