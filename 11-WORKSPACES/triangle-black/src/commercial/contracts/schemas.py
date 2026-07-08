from __future__ import annotations
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class ContractResponse(BaseModel):
    id: str
    quote_id: str
    lead_id: str
    title: str
    description: Optional[str]
    services: List[dict]
    total_value: float
    monthly_value: float
    status: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    duration_months: int
    renewal_count: int
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ContractUpdate(BaseModel):
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    notes: Optional[str] = None
