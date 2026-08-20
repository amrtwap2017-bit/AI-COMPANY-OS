"""
DDD Schemas for SLA Dashboard Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class SLAMetric(BaseModel):
    hotel_id: str
    total_orders: int = 0
    met_count: int = 0
    breached_count: int = 0
    on_track_count: int = 0
    compliance_pct: float = 0.0
    avg_resolution_hours: float = 0.0

class SLAPriorityBreakdown(BaseModel):
    priority: str
    total: int
    met: int
    breached: int
    compliance_pct: float

class SLADashboardSummary(BaseModel):
    hotel_id: str
    overall: SLAMetric
    by_priority: List[SLAPriorityBreakdown] = []
    recent_breaches: List[Dict[str, Any]] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)
