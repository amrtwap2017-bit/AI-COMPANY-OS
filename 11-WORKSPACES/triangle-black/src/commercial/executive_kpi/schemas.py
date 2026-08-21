"""
Schemas for Executive KPI Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ExecutiveKPISummary(BaseModel):
    hotel_id: str
    total_revenue: float = 0.0
    active_contracts_count: int = 0
    work_orders_completed: int = 0
    sla_compliance_rate: float = 0.0
    active_technicians_count: int = 0
    customer_satisfaction_score: float = 90.0

class TrendPoint(BaseModel):
    period: str
    metric_name: str
    value: float

class BalancedScorecard(BaseModel):
    hotel_id: str
    financial_score: float = 95.0
    customer_score: float = 90.0
    internal_operations_score: float = 92.0
    learning_growth_score: float = 88.0
    overall_score: float = 91.25
    generated_at: datetime = Field(default_factory=datetime.utcnow)
