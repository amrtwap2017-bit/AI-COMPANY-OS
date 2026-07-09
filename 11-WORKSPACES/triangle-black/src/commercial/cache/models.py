from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Index
from src.core.base import Base


class CacheConfig(Base):
    __tablename__ = "cache_configs"

    id         = Column(String(36), primary_key=True,
                        default=lambda: str(uuid.uuid4()))
    hotel_id   = Column(String(36), nullable=False,
                        default="tb-default-hotel-000000000001")
    endpoint   = Column(String(255), nullable=False)
    ttl        = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_cache_configs_endpoint", "endpoint"),
    )