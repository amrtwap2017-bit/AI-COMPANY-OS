from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional

class AgentCreate(BaseModel):
    name: str
    email: EmailStr
    max_leads: int = 20

class AgentResponse(BaseModel):
    id: str
    name: str
    email: str
    max_leads: int
    current_leads: int
    is_active: str
    model_config = {"from_attributes": True}

class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    source: str = "web"
    priority: str = "medium"
    notes: Optional[str] = None

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None

class LeadStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None

class LeadResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str]
    company: Optional[str]
    source: str
    status: str
    priority: str
    score: int
    grade: str
    notes: Optional[str]
    assigned_agent_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class ActivityResponse(BaseModel):
    id: str
    lead_id: str
    type: str
    description: str
    actor: str
    created_at: datetime
    model_config = {"from_attributes": True}

class QualificationResult(BaseModel):
    lead_id: str
    score: int
    grade: str
    breakdown: dict
    recommendation: str

class PipelineSummary(BaseModel):
    total: int
    by_status: dict
    by_source: dict
    conversion_rate: float
    avg_score: float
