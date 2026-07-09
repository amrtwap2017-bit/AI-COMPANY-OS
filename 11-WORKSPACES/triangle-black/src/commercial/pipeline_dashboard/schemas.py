from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class PipelineCreate(BaseModel):
    stage: str
    quote_total: float = 0.0


class PipelineUpdate(BaseModel):
    stage: Optional[str] = None
    quote_total: Optional[float] = None


class PipelineResponse(BaseModel):
    id: str
    hotel_id: str
    stage: str
    quote_total: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True