"""
PaginatedResponse model — Triangle Black
Tracks pagination metadata for API responses (for analytics/audit purposes).
"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class PaginationLog(Base):
    """Lightweight audit log of paginated queries — useful for performance monitoring."""
    __tablename__ = "paginated_responses"

    id          = Column(String(36), primary_key=True,
                         default=lambda: str(uuid.uuid4()))
    hotel_id    = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    endpoint    = Column(String(255), nullable=False)
    skip        = Column(Integer,     nullable=False, default=0)
    limit       = Column(Integer,     nullable=False, default=100)
    total_count = Column(Integer,     nullable=False, default=0)
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_paginated_responses_hotel_id", "hotel_id"),
        Index("ix_paginated_responses_endpoint", "hotel_id", "endpoint"),
    )
