"""
Lead SQLAlchemy model — Triangle Black
Matches actual leads table in DB (all 13 columns).
"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class Lead(Base):
    __tablename__ = "leads"

    id         = Column(String(36), primary_key=True,
                        default=lambda: str(uuid.uuid4()))
    hotel_id   = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    name       = Column(String(255), nullable=False)
    email      = Column(String(255), nullable=False)
    phone      = Column(String(50),  nullable=True)
    company    = Column(String(255), nullable=True)
    source     = Column(String(50),  nullable=False, default="direct")
    status     = Column(String(50),  nullable=False, default="new")
    priority   = Column(String(20),  nullable=False, default="medium")
    score      = Column(Integer,     nullable=False, default=0)
    notes      = Column(Text,        nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_leads_hotel_id", "hotel_id"),
    )
