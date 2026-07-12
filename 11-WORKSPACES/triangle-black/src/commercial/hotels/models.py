from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""
Hotel SQLAlchemy model — Triangle Black
Matches actual hotels table in DB (all 15 columns).
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Index
from src.core.base import Base


class Hotel(Base):
    __tablename__ = "hotels"

    id         = Column(String(36), primary_key=True,
                        default=lambda: str(uuid.uuid4()))
    name       = Column(String(255), nullable=False)
    slug       = Column(String(100), nullable=False, unique=True)
    brand      = Column(String(255), nullable=True)
    city       = Column(String(100), nullable=True)
    country    = Column(String(100), nullable=True, default="Egypt")
    address    = Column(Text,        nullable=True)
    phone      = Column(String(50),  nullable=True)
    email      = Column(String(255), nullable=True)
    rooms      = Column(String(20),  nullable=True)
    stars      = Column(String(5),   nullable=True)
    is_active  = Column(Boolean,     nullable=False, default=True)
    settings   = Column(JSON,        nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_hotels_is_active", "is_active"),
    )
