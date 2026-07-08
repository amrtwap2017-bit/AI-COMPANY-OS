from __future__ import annotations
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class QuoteCreate(BaseModel):
    title: str
    description: Optional[str] = None
    lead_id: Optional[str] = None
    items: List[dict] = []
    total: float = 0.0
    validity_date: Optional[datetime] = None

class QuoteUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    items: Optional[List[dict]] = None
    total: Optional[float] = None
    status: Optional[str] = None
    validity_date: Optional[datetime] = None

class QuoteResponse(BaseModel):
    id: str
    lead_id: Optional[str]
    title: str
    description: Optional[str]
    items: List[dict]
    total: float
    status: str
    validity_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
