"""
Contract Pydantic schemas — Triangle Black
Matches actual contracts table in DB.
"""
from __future__ import annotations
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel


class ContractCreate(BaseModel):
    quote_id:        str
    lead_id:         str
    title:           str
    description:     Optional[str] = None
    services:        Optional[List[Any]] = None
    total_value:     float = 0.0
    monthly_value:   float = 0.0
    status:          str = "pending_signature"
    start_date:      Optional[datetime] = None
    end_date:        Optional[datetime] = None
    duration_months: int = 12
    renewal_count:   int = 0
    notes:           Optional[str] = None


class ContractUpdate(BaseModel):
    title:           Optional[str] = None
    description:     Optional[str] = None
    services:        Optional[List[Any]] = None
    total_value:     Optional[float] = None
    monthly_value:   Optional[float] = None
    status:          Optional[str] = None
    start_date:      Optional[datetime] = None
    end_date:        Optional[datetime] = None
    duration_months: Optional[int] = None
    renewal_count:   Optional[int] = None
    notes:           Optional[str] = None


class ContractResponse(BaseModel):
    id:              str
    hotel_id:        str
    quote_id:        str
    lead_id:         str
    title:           str
    description:     Optional[str]
    services:        Optional[List[Any]]
    total_value:     float
    monthly_value:   float
    status:          str
    start_date:      Optional[datetime]
    end_date:        Optional[datetime]
    duration_months: int
    renewal_count:   int
    notes:           Optional[str]
    created_at:      datetime
    updated_at:      datetime

    class Config:
        from_attributes = True
