"""
approval_center/schemas.py — Sprint-078: DDD compliance
Schemas for unified approval queue items.
No own table — reads from quotes/purchase_requests/purchase_orders.
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ApprovalQueueItem(BaseModel):
    id: str
    title: str
    approval_type: str
    status: str
    amount: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ApprovalQueueResponse(BaseModel):
    queue: List[ApprovalQueueItem]
    counts: dict
    total: int
    hotel_id: str


class ApprovalCountResponse(BaseModel):
    pending_quotes: int
    pending_prs: int
    pending_pos: int
    total: int
