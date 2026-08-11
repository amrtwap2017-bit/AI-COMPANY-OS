"""
Activity Pydantic schemas — Sprint-128: fixed to match actual model
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class ActivityCreate(BaseModel):
    type: str
    description: Optional[str] = None
    actor: Optional[str] = None
    lead_id: Optional[str] = None


class ActivityUpdate(BaseModel):
    type: Optional[str] = None
    description: Optional[str] = None
    actor: Optional[str] = None
    lead_id: Optional[str] = None


class ActivityResponse(BaseModel):
    id: str
    hotel_id: str
    type: str
    description: Optional[str] = None
    actor: Optional[str] = None
    lead_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
