"""
Agent Pydantic schemas
"""
from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


class AgentCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    source: str = "web"
    priority: str = "medium"
    notes: Optional[str] = None


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None


class AgentResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str]
    company: Optional[str]
    source: str
    status: str
    priority: str
    score: int
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
