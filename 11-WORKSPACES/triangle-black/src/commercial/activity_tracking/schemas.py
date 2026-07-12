from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""
Activity Pydantic schemas — Triangle Black
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class ActivityCreate(BaseModel):
    name: str
    status: str = "active"
    notes: Optional[str] = None


class ActivityUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class ActivityResponse(BaseModel):
    id: str
    hotel_id: str
    name: str
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
