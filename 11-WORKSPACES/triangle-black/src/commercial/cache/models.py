"""
CacheConfig SQLAlchemy model — Triangle Black
Stores cache configuration per hotel (TTL settings, enabled flags, etc.)
"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class CacheConfig(Base):
    __tablename__ = "cache_configs"

    id          = Column(String(36), primary_key=True,
                         default=lambda: str(uuid.uuid4()))
    hotel_id    = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    cache_key   = Column(String(255), nullable=False)
    ttl_seconds = Column(Integer,     nullable=False, default=300)
    enabled     = Column(Boolean,     nullable=False, default=True)
    description = Column(String(500), nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at  = Column(DateTime, default=datetime.utcnow,
                          onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_cache_configs_hotel_id", "hotel_id"),
        Index("ix_cache_configs_hotel_key", "hotel_id", "cache_key", unique=True),
    )
