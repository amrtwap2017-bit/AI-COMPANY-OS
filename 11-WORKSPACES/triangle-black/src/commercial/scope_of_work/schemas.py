"""scope_of_work/schemas.py — Sprint-082"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ScopeOfWorkBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "draft"
    total_value: Optional[float] = 0
    contract_id: Optional[str] = None

class ScopeOfWorkCreate(ScopeOfWorkBase):
    hotel_id: Optional[str] = None

class ScopeOfWorkResponse(ScopeOfWorkBase):
    id: str
    hotel_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
