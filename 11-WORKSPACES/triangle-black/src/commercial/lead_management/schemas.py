from __future__ import annotations
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LeadCreate(BaseModel):
    name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    source: str = "manual"
    priority: str = "medium"
    status: str = "new"
    score: int = 0
    agent_id: Optional[str] = None
    hotel_id: Optional[str] = None
    notes: Optional[str] = None


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    source: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    score: Optional[int] = None
    agent_id: Optional[str] = None
    notes: Optional[str] = None


class LeadResponse(BaseModel):
    id: str
    hotel_id: Optional[str] = None
    name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    source: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    score: Optional[int] = None
    agent_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
