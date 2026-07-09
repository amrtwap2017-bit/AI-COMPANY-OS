from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel


class PaginatedResponseCreate(BaseModel):
    data: List[dict]
    skip: int = 0
    limit: int = 20


class PaginatedResponseUpdate(BaseModel):
    data: Optional[List[dict]] = None
    skip: Optional[int] = None
    limit: Optional[int] = None


class PaginatedResponseResponse(BaseModel):
    id: str
    hotel_id: str
    data: List[dict]
    skip: int
    limit: int
    total_count: int

    class Config:
        from_attributes = True