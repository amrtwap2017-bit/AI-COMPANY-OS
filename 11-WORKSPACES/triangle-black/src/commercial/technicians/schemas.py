from __future__ import annotations
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class TechnicianCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    specializations: List[str] = []
    max_work_orders: int = 10
    is_active: bool = True
    notes: Optional[str] = None

class TechnicianUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    specializations: Optional[List[str]] = None
    max_work_orders: Optional[int] = None
    current_work_orders: Optional[int] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class TechnicianResponse(BaseModel):
    id: str
    hotel_id: str
    name: str
    email: str
    phone: Optional[str]
    specializations: List[str]
    max_work_orders: int
    current_work_orders: int
    is_active: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
