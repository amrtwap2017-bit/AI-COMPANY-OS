"""
WebhookConfig SQLAlchemy model — Triangle Black
"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class WebhookConfig(Base):
    __tablename__ = "webhookconfigs"

    id         = Column(String(36), primary_key=True,
                        default=lambda: str(uuid.uuid4()))
    hotel_id   = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    name       = Column(String(255), nullable=False)
    status     = Column(String(50),  nullable=False, default="active")
    notes      = Column(Text,        nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_webhookconfigs_hotel_id", "hotel_id"),
        Index("ix_webhookconfigs_hotel_status", "hotel_id", "status"),
    )
