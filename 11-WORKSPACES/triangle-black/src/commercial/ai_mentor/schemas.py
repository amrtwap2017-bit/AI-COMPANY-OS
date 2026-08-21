"""
Schemas for AI Mentor Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class DecisionRecordIn(BaseModel):
    context_type: str
    decision_taken: str
    entity_id: Optional[str] = None
    reasoning: Optional[str] = None
    parameters: Dict[str, Any] = {}

class OutcomeRecordIn(BaseModel):
    outcome_status: str
    efficiency_score: float = Field(..., ge=0.0, le=100.0)
    notes: Optional[str] = None

class MentorGuidance(BaseModel):
    context_type: str
    recommendation: str
    confidence_score: float
    best_practices: List[str] = []
