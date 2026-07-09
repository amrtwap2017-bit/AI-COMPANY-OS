from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class AgentCreate(BaseModel):
    name: str
    max_leads: int = 20


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    max_leads: Optional[int] = None


class AgentResponse(BaseModel):
    id: str
    hotel_id: str
    name: str
    max_leads: int
    assigned_leads: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True