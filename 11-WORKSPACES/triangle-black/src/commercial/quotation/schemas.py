"""
Quote Pydantic schemas
"""
from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class QuoteCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "active"


class QuoteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class QuoteResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
