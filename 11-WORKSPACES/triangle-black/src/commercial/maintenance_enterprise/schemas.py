"""
Schemas for Maintenance Enterprise Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class PMPlanCreateIn(BaseModel):
    asset_id: str
    name: str
    frequency_days: int = 30
    description: Optional[str] = None
    checklist: List[str] = []

class PMPlanOut(BaseModel):
    id: str
    asset_id: str
    name: str
    frequency_days: int
    is_active: bool = True
    next_due_date: Optional[datetime] = None

class MaintenanceDashboardKPIs(BaseModel):
    hotel_id: str
    total_pm_plans: int = 0
    active_plans: int = 0
    overdue_pm_count: int = 0
    pm_compliance_rate: float = 100.0
