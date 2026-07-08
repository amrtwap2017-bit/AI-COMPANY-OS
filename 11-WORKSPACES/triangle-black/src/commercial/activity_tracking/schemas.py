from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ActivityCreate(BaseModel):
    lead_id: str
    type: str = "note"
    description: str
    actor: str = "system"

class ActivityUpdate(BaseModel):
    type: Optional[str] = None
    description: Optional[str] = None
    actor: Optional[str] = None

class ActivityResponse(BaseModel):
    id: str
    lead_id: str
    type: str
    description: str
    actor: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
