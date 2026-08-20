"""
Schemas for Customer Success Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class NPSScoreIn(BaseModel):
    score: int = Field(..., ge=0, le=10)
    feedback: Optional[str] = None
    contact_name: Optional[str] = None

class CustomerHealthSummary(BaseModel):
    hotel_id: str
    health_score: float = 85.0
    active_contracts: int = 0
    open_tickets: int = 0
    satisfaction_rate: float = 90.0
    renewal_risk: str = "low"
    generated_at: datetime = Field(default_factory=datetime.utcnow)
