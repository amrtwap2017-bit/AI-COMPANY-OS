"""
Activity SQLAlchemy model — Triangle Black
Matches actual activities table in DB.
"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class Activity(Base):
    __tablename__ = "activities"

    id          = Column(String(36), primary_key=True,
                         default=lambda: str(uuid.uuid4()))
    hotel_id    = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    lead_id     = Column(String(36), nullable=True)
    type        = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    actor       = Column(String(255), nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at  = Column(DateTime, default=datetime.utcnow,
                         onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_activities_hotel_id", "hotel_id"),
        Index("ix_activities_lead_id", "lead_id"),
    )
