"""
Schemas for Sales Pipeline Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class PipelineStageSummary(BaseModel):
    stage: str
    count: int
    value: float = 0.0

class PipelineOverview(BaseModel):
    hotel_id: str
    total_leads: int
    stages: List[PipelineStageSummary] = []
    conversion_rate_pct: float = 0.0
    weighted_pipeline_value: float = 0.0
    generated_at: datetime = Field(default_factory=datetime.utcnow)
