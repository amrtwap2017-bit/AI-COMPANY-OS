"""
Quote Pydantic schemas — Triangle Black
Matches actual quotes table in DB.
"""
from __future__ import annotations
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel


class QuoteCreate(BaseModel):
    lead_id:       Optional[str] = None
    title:         str
    description:   Optional[str] = None
    items:         Optional[List[Any]] = None
    total:         float = 0.0
    status:        str = "draft"
    validity_date: Optional[datetime] = None


class QuoteUpdate(BaseModel):
    lead_id:       Optional[str] = None
    title:         Optional[str] = None
    description:   Optional[str] = None
    items:         Optional[List[Any]] = None
    total:         Optional[float] = None
    status:        Optional[str] = None
    validity_date: Optional[datetime] = None


class QuoteResponse(BaseModel):
    id:            str
    hotel_id:      str
    lead_id:       Optional[str]
    title:         str
    description:   Optional[str]
    items:         Optional[List[Any]]
    total:         float
    status:        str
    validity_date: Optional[datetime]
    created_at:    datetime
    updated_at:    datetime

    class Config:
        from_attributes = True
