from pydantic import BaseModel
from typing import Optional
from src.commercial.lead_management.models import LeadStatus, Priority, Source

class LeadCreate(BaseModel):
    name: str
    email: str
    phone: str
    company: str
    source: Source
    priority: Priority
    score: float
    notes: Optional[str] = None

class LeadUpdate(BaseModel):
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    company: Optional[str]
    source: Optional[Source]
    status: Optional[LeadStatus]
    priority: Optional[Priority]
    score: Optional[float]
    notes: Optional[str]

class LeadResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    company: str
    source: Source
    status: LeadStatus
    priority: Priority
    score: float
    notes: Optional[str]

    class Config:
        orm_mode = True