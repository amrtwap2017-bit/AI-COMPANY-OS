from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class HotelCreate(BaseModel):
    name: str
    slug: str
    brand: Optional[str] = None
    city: Optional[str] = None
    country: str = "Egypt"
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    rooms: Optional[str] = None
    stars: Optional[str] = None
    settings: dict = {}


class HotelUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    rooms: Optional[str] = None
    stars: Optional[str] = None
    is_active: Optional[bool] = None
    settings: Optional[dict] = None


class HotelResponse(BaseModel):
    id: str
    name: str
    slug: str
    brand: Optional[str]
    city: Optional[str]
    country: Optional[str]
    address: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    rooms: Optional[str]
    stars: Optional[str]
    is_active: bool
    settings: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
