"""
Schemas for Executive Intelligence Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ExecutiveIntelligenceSection(BaseModel):
    title: str
    status: str
    key_metrics: Dict[str, Any]
    insights: List[str] = []

class ExecutiveIntelligenceOverview(BaseModel):
    hotel_id: str
    summary_status: str = "operational"
    operations: Optional[Dict[str, Any]] = None
    maintenance: Optional[Dict[str, Any]] = None
    procurement: Optional[Dict[str, Any]] = None
    financial: Optional[Dict[str, Any]] = None
    generated_at: datetime = Field(default_factory=datetime.utcnow)
