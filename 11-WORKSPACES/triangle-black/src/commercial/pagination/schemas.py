"""
Pagination Pydantic schemas — Triangle Black
Matches actual paginated_responses table: id, hotel_id, data, skip, limit, total_count, created_at
"""
from __future__ import annotations
from typing import Generic, List, TypeVar
from pydantic import BaseModel
from datetime import datetime

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper for list endpoints."""
    items: List[T]
    total: int
    skip: int
    limit: int
    has_more: bool

    @classmethod
    def build(cls, items: List[T], total: int, skip: int, limit: int) -> "PaginatedResponse[T]":
        return cls(
            items=items,
            total=total,
            skip=skip,
            limit=limit,
            has_more=(skip + len(items)) < total,
        )


class PaginationLogCreate(BaseModel):
    skip: int = 0
    limit: int = 100
    total_count: int = 0
    data: str = "{}"


class PaginationLogResponse(BaseModel):
    id: str
    hotel_id: str
    data: str
    skip: int
    limit: int
    total_count: int
    created_at: datetime

    class Config:
        from_attributes = True
