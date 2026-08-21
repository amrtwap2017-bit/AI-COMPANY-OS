"""
Schemas for AI Scheduling Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class TechnicianCapacity(BaseModel):
    id: str
    name: str
    max_work_orders: int
    current_work_orders: int
    utilization_pct: float
    is_active: bool

class DispatchRecommendation(BaseModel):
    work_order_id: str
    recommended_technician_id: str
    technician_name: str
    confidence_score: float
    reason: str

class DailyPlan(BaseModel):
    hotel_id: str
    total_assigned: int = 0
    total_unassigned: int = 0
    technicians: List[TechnicianCapacity] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)
