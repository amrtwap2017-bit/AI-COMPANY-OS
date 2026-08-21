"""
Schemas for Analytics Platform Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ScorecardMetrics(BaseModel):
    hotel_id: str
    operations_score: float = 100.0
    maintenance_score: float = 100.0
    sourcing_score: float = 100.0
    overall_health: float = 100.0

class SLABreachTrendPoint(BaseModel):
    date_str: str
    breach_count: int
    resolution_rate: float

class AnalyticsPlatformOverview(BaseModel):
    hotel_id: str
    scorecards: ScorecardMetrics
    sla_trends: List[SLABreachTrendPoint] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)
