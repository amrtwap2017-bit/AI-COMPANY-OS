from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class CacheConfigCreate(BaseModel):
    endpoint: str
    ttl: int
    # add domain-specific fields here


class CacheConfigUpdate(BaseModel):
    endpoint: Optional[str] = None
    ttl: Optional[int] = None
    # add domain-specific fields here — all Optional


class CacheConfigResponse(BaseModel):
    id: str
    hotel_id: str
    endpoint: str
    ttl: int
    created_at: datetime
    updated_at: datetime
    # add domain-specific fields here

    class Config:
        from_attributes = True