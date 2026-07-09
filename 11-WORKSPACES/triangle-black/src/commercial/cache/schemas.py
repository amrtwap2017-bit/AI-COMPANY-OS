"""
CacheConfig Pydantic schemas — Triangle Black
"""
from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class CacheConfigCreate(BaseModel):
    cache_key: str
    ttl_seconds: int = 300
    enabled: bool = True
    description: Optional[str] = None


class CacheConfigUpdate(BaseModel):
    ttl_seconds: Optional[int] = None
    enabled: Optional[bool] = None
    description: Optional[str] = None


class CacheConfigResponse(BaseModel):
    id: str
    hotel_id: str
    cache_key: str
    ttl_seconds: int
    enabled: bool
    description: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
