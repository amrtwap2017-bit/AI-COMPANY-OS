"""approval_requests/schemas.py — Sprint-083"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApprovalRequestBase(BaseModel):
    entity_type: str
    entity_id: str
    title: Optional[str] = None
    amount: Optional[float] = None
    status: str = "pending"
    requested_by: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = "normal"
    notes: Optional[str] = None

class ApprovalRequestCreate(ApprovalRequestBase):
    hotel_id: Optional[str] = None

class ApprovalRequestResponse(ApprovalRequestBase):
    id: str
    hotel_id: Optional[str]
    requested_at: datetime
    resolved_at: Optional[datetime]
    class Config:
        from_attributes = True
