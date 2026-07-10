from __future__ import annotations
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel

class GoodsReceiptCreate(BaseModel):
    po_id: Optional[str] = None
    vendor_id: Optional[str] = None
    warehouse_id: str
    received_date: Optional[datetime] = None
    lines: List[Any] = []
    notes: Optional[str] = None
    received_by: Optional[str] = None

class GoodsReceiptUpdate(BaseModel):
    status: Optional[str] = None
    lines: Optional[List[Any]] = None
    notes: Optional[str] = None

class GoodsReceiptResponse(BaseModel):
    id: str
    hotel_id: str
    grn_number: str
    po_id: Optional[str]
    vendor_id: Optional[str]
    warehouse_id: str
    received_date: datetime
    status: str
    lines: List[Any]
    notes: Optional[str]
    received_by: Optional[str]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
