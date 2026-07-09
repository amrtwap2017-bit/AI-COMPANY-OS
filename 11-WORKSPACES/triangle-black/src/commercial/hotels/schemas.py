from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class HotelCreate(BaseModel):
    name: str
    code: Optional[str] = None
    address: Optional[str] = None
    subscription_tier: Optional[str] = None


class HotelUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    address: Optional[str] = None
    subscription_tier: Optional[str] = None


class HotelResponse(BaseModel):
    id: str
    hotel_id: str
    name: str
    code: Optional[str]
    address: Optional[str]
    subscription_tier: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True