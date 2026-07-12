from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""
LeadSearch Pydantic schemas
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class LeadSearchCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "active"


class LeadSearchUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class LeadSearchResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
