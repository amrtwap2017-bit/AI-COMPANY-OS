from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""
WebhookConfig Pydantic schemas — Triangle Black
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class WebhookConfigCreate(BaseModel):
    name: str
    status: str = "active"
    notes: Optional[str] = None


class WebhookConfigUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class WebhookConfigResponse(BaseModel):
    id: str
    hotel_id: str
    name: str
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
