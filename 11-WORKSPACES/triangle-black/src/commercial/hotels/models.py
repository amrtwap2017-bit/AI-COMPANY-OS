"""
Hotel SQLAlchemy model — Triangle Black
Hotels ARE the top-level tenants. They do not have a hotel_id foreign key.
Every other entity has a hotel_id referencing Hotel.id.
"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Index
from src.core.base import Base


class Hotel(Base):
    __tablename__ = "hotels"

    id                = Column(String(36), primary_key=True,
                               default=lambda: str(uuid.uuid4()))
    name              = Column(String(255), nullable=False)
    code              = Column(String(50),  nullable=True)
    address           = Column(Text,        nullable=True)
    subscription_tier = Column(String(50),  nullable=True, default="basic")
    is_active         = Column(Boolean,     nullable=False, default=True)
    created_at        = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at        = Column(DateTime, default=datetime.utcnow,
                               onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_hotels_is_active", "is_active"),
        Index("ix_hotels_name", "name"),
    )
