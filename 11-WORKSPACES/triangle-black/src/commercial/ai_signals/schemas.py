"""
Schemas for AI Signals Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class AISignalPoint(BaseModel):
    signal_type: str
    target_id: str
    target_name: str
    severity: str = "medium"
    description: str
    metadata: Dict[str, Any] = {}

class AISignalsSummary(BaseModel):
    hotel_id: str
    total_signals: int = 0
    signals: List[AISignalPoint] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)
