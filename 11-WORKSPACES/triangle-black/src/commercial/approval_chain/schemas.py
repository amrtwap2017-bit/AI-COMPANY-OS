"""approval_chain/schemas.py — Sprint-083"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApprovalChainEntry(BaseModel):
    pr_id: str
    approver_id: Optional[str] = None
    approver_name: Optional[str] = None
    action: str = "pending"
    notes: Optional[str] = None

class ApprovalChainResponse(ApprovalChainEntry):
    id: str
    hotel_id: Optional[str]
    actioned_at: Optional[datetime]
    created_at: datetime
    class Config:
        from_attributes = True
