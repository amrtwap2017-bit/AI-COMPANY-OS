from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class LeadCreate(BaseModel):
    name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    email: str
    source: str
    priority: str = "medium"
    status: str = "new"
    score: int = 0
    agent_id: Optional[str] = None
    hotel_id: Optional[str] = None

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

class LeadResponse(BaseModel):
    id: str
    hotel_id: str
    name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    email: str
    source: str
    priority: str
    status: str
    score: int = 0
    notes: Optional[str] = None
    agent_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
