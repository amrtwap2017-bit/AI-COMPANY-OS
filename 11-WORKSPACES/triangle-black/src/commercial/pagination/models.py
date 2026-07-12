from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""
PaginationLog model — Triangle Black
Matches the actual paginated_responses table in DB:
  id, hotel_id, data, skip, limit, total_count, created_at
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class PaginationLog(Base):
    __tablename__ = "paginated_responses"

    id          = Column(String(36), primary_key=True,
                         default=lambda: str(uuid.uuid4()))
    hotel_id    = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    data        = Column(Text,        nullable=False, default="{}")
    skip        = Column(Integer,     nullable=False, default=0)
    limit       = Column(Integer,     nullable=False, default=100)
    total_count = Column(Integer,     nullable=False, default=0)
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_paginated_responses_hotel_id", "hotel_id"),
    )
