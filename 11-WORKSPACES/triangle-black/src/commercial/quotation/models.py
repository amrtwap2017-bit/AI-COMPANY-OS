from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""
Quote SQLAlchemy model — Triangle Black
Matches actual quotes table in DB.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Float, JSON, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class Quote(Base):
    __tablename__ = "quotes"

    id             = Column(String(36), primary_key=True,
                            default=lambda: str(uuid.uuid4()))
    hotel_id       = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    lead_id        = Column(String(36), nullable=True)
    title          = Column(String(500), nullable=False)
    description    = Column(Text, nullable=True)
    items          = Column(JSON, nullable=True)
    total          = Column(Float, nullable=False, default=0.0)
    status         = Column(String(50), nullable=False, default="draft")
    validity_date  = Column(DateTime, nullable=True)
    created_at     = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at     = Column(DateTime, default=datetime.utcnow,
                            onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_quotes_hotel_id", "hotel_id"),
        Index("ix_quotes_hotel_status", "hotel_id", "status"),
        Index("ix_quotes_lead_id", "lead_id"),
    )
