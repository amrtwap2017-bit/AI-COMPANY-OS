from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""
Agent Pydantic schemas — Triangle Black
Matches actual agents table in DB.
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class AgentCreate(BaseModel):
    name:          str
    email:         str
    phone:         Optional[str] = None
    max_leads:     int = 10
    current_leads: int = 0
    is_active:     bool = True


class AgentUpdate(BaseModel):
    name:          Optional[str] = None
    email:         Optional[str] = None
    phone:         Optional[str] = None
    max_leads:     Optional[int] = None
    current_leads: Optional[int] = None
    is_active:     Optional[bool] = None


class AgentResponse(BaseModel):
    id:            str
    hotel_id:      str
    name:          str
    email:         str
    phone:         Optional[str]
    max_leads:     int
    current_leads: int
    is_active:     bool
    created_at:    datetime
    updated_at:    datetime

    class Config:
        from_attributes = True
