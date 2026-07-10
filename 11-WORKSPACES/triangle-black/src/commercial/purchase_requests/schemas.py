from __future__ import annotations
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel

class PurchaseRequestCreate(BaseModel):
    requester: str
    department: Optional[str] = None
    urgency: str = "normal"
    required_date: Optional[datetime] = None
    contract_id: Optional[str] = None
    project_ref: Optional[str] = None
    justification: Optional[str] = None
    lines: List[Any] = []

class PurchaseRequestUpdate(BaseModel):
    requester: Optional[str] = None
    department: Optional[str] = None
    urgency: Optional[str] = None
    required_date: Optional[datetime] = None
    status: Optional[str] = None
    justification: Optional[str] = None
    lines: Optional[List[Any]] = None
    rejection_note: Optional[str] = None

class PurchaseRequestResponse(BaseModel):
    id: str
    hotel_id: str
    pr_number: str
    requester: str
    department: Optional[str]
    urgency: str
    required_date: Optional[datetime]
    contract_id: Optional[str]
    project_ref: Optional[str]
    status: str
    justification: Optional[str]
    lines: List[Any]
    approved_by: Optional[str]
    approved_at: Optional[datetime]
    rejection_note: Optional[str]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
