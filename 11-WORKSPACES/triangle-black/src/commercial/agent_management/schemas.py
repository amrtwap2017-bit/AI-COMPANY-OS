from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class AgentCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    max_leads: int = 10

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    max_leads: Optional[int] = None
    current_leads: Optional[int] = None
    is_active: Optional[bool] = None

class AgentResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str]
    max_leads: int
    current_leads: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
