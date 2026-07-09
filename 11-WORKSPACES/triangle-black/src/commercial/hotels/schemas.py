"""
Hotel Pydantic schemas — Triangle Black
Hotels are top-level tenants — no hotel_id scoping.
"""
from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class HotelCreate(BaseModel):
    name: str
    code: Optional[str] = None
    address: Optional[str] = None
    subscription_tier: Optional[str] = "basic"


class HotelUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    address: Optional[str] = None
    subscription_tier: Optional[str] = None
    is_active: Optional[bool] = None


class HotelResponse(BaseModel):
    id: str
    name: str
    code: Optional[str]
    address: Optional[str]
    subscription_tier: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
