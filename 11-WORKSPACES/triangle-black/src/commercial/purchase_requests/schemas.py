from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class PurchaseRequestCreate(BaseModel):
    requester: str = "Portal User"
    department: Optional[str] = None
    urgency: str = "normal"
    required_date: Optional[datetime] = None
    contract_id: Optional[str] = None
    project_ref: Optional[str] = None
    justification: Optional[str] = None
    lines: Optional[List[Any]] = []
    title: Optional[str] = None
    request_type: Optional[str] = None
    requester_id: Optional[str] = None
    linked_contract_id: Optional[str] = None
    linked_project_id: Optional[str] = None
    priority: Optional[str] = None


class PurchaseRequestUpdate(BaseModel):
    requester: Optional[str] = None
    department: Optional[str] = None
    urgency: Optional[str] = None
    required_date: Optional[datetime] = None
    contract_id: Optional[str] = None
    project_ref: Optional[str] = None
    status: Optional[str] = None
    justification: Optional[str] = None
    lines: Optional[List[Any]] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_note: Optional[str] = None


class PurchaseRequestResponse(BaseModel):
    id: str
    hotel_id: Optional[str] = None
    pr_number: Optional[str] = None
    requester: Optional[str] = None
    department: Optional[str] = None
    urgency: Optional[str] = None
    required_date: Optional[datetime] = None
    contract_id: Optional[str] = None
    project_ref: Optional[str] = None
    status: Optional[str] = None
    justification: Optional[str] = None
    lines: Optional[Any] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_note: Optional[str] = None
    title: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
