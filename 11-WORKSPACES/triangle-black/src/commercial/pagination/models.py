from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Index
from src.core.base import Base


class PaginatedResponse(Base):
    __tablename__ = "paginated_responses"

    id         = Column(String(36), primary_key=True,
                        default=lambda: str(uuid.uuid4()))
    hotel_id   = Column(String(36), nullable=False,
                        default="tb-default-hotel-000000000001")
    data       = Column(Text, nullable=False)
    skip       = Column(Integer, nullable=False)
    limit      = Column(Integer, nullable=False)
    total_count= Column(Integer, nullable=False)

    __table_args__ = (
        Index("ix_paginated_responses_hotel_id", "hotel_id"),
    )