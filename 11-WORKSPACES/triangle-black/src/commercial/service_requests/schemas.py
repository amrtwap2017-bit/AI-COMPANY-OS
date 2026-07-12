from __future__ import annotations
from datetime import datetime


from datetime import datetime
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ServiceRequestCreate(BaseModel):
    title: str
    category: str = "general"
    urgency: str = "normal"
    contract_id: Optional[str] = None
    site_id: Optional[str] = None
    submitted_by: Optional[str] = None
    contact_phone: Optional[str] = None
    description: Optional[str] = None
    preferred_date: Optional[datetime] = None

class ServiceRequestUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    urgency: Optional[str] = None
    status: Optional[str] = None
    work_order_id: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None

class ServiceRequestResponse(BaseModel):
    id: str
    hotel_id: str
    contract_id: Optional[str]
    site_id: Optional[str]
    work_order_id: Optional[str]
    submitted_by: Optional[str]
    contact_phone: Optional[str]
    category: str
    urgency: str
    status: str
    title: str
    description: Optional[str]
    preferred_date: Optional[datetime]
    resolved_at: Optional[datetime]
    resolution_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
