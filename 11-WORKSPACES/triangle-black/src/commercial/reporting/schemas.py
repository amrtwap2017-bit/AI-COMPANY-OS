from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ReportCreate(BaseModel):
    name: str
    period: str = "monthly"
    metrics: dict = {}
    total_leads: float = 0.0
    conversion_rate: float = 0.0
    revenue_pipeline: float = 0.0

class ReportUpdate(BaseModel):
    name: Optional[str] = None
    period: Optional[str] = None
    metrics: Optional[dict] = None
    total_leads: Optional[float] = None
    conversion_rate: Optional[float] = None
    revenue_pipeline: Optional[float] = None

class ReportResponse(BaseModel):
    id: str
    name: str
    period: str
    metrics: dict
    total_leads: float
    conversion_rate: float
    revenue_pipeline: float
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
