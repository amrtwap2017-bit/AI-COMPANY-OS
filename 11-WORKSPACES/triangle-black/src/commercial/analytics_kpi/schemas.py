"""
Schemas for Analytics KPI Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class KPISummary(BaseModel):
    hotel_id: str
    total_work_orders: int = 0
    completed_work_orders: int = 0
    active_technicians: int = 0
    paid_invoices_value: float = 0.0
    active_contracts: int = 0
    conversion_rate: float = 0.0
    completion_rate: float = 0.0

class CashFlowPoint(BaseModel):
    month: str
    inflow: float = 0.0
    outflow: float = 0.0
    net: float = 0.0

class TrendSeriesPoint(BaseModel):
    date: str
    leads_count: int = 0
    revenue: float = 0.0

class AnalyticsKPIOverview(BaseModel):
    hotel_id: str
    overall: KPISummary
    cashflow: List[CashFlowPoint] = []
    trends: List[TrendSeriesPoint] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)
