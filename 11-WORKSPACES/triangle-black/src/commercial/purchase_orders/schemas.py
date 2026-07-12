from __future__ import annotations
from datetime import datetime


from datetime import datetime
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel

class PurchaseOrderCreate(BaseModel):
    vendor_id: str
    pr_id: Optional[str] = None
    expected_date: Optional[datetime] = None
    lines: List[Any] = []
    subtotal: float = 0
    vat_amount: float = 0
    total_amount: float = 0
    payment_terms: Optional[str] = None
    delivery_notes: Optional[str] = None

class PurchaseOrderUpdate(BaseModel):
    vendor_id: Optional[str] = None
    expected_date: Optional[datetime] = None
    status: Optional[str] = None
    lines: Optional[List[Any]] = None
    subtotal: Optional[float] = None
    vat_amount: Optional[float] = None
    total_amount: Optional[float] = None
    payment_terms: Optional[str] = None
    delivery_notes: Optional[str] = None

class PurchaseOrderResponse(BaseModel):
    id: str
    hotel_id: str
    po_number: str
    vendor_id: str
    pr_id: Optional[str]
    status: str
    expected_date: Optional[datetime]
    lines: List[Any]
    subtotal: float
    vat_amount: float
    total_amount: float
    payment_terms: Optional[str]
    delivery_notes: Optional[str]
    approved_by: Optional[str]
    approved_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
