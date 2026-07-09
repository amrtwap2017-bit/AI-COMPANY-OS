"""
Pipeline Pydantic schemas — Triangle Black
"""
from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class PipelineCreate(BaseModel):
    name: str
    status: str = "active"
    notes: Optional[str] = None


class PipelineUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class PipelineResponse(BaseModel):
    id: str
    hotel_id: str
    name: str
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
