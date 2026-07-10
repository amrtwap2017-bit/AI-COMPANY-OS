"""
Agent SQLAlchemy model — Triangle Black
Matches actual agents table in DB.
"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class Agent(Base):
    __tablename__ = "agents"

    id            = Column(String(36), primary_key=True,
                           default=lambda: str(uuid.uuid4()))
    hotel_id      = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    name          = Column(String(255), nullable=False)
    email         = Column(String(255), nullable=True)
    phone         = Column(String(50), nullable=True)
    max_leads     = Column(Integer, nullable=False, default=20)
    current_leads = Column(Integer, nullable=False, default=0)
    is_active     = Column(Boolean, nullable=False, default=True)
    created_at    = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at    = Column(DateTime, default=datetime.utcnow,
                           onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_agents_hotel_id", "hotel_id"),
    )
