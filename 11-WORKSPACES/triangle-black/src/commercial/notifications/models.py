"""
Notification — Triangle Black
Auto-created on key business events. Role-based fan-out.
"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Boolean, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class Notification(Base):
    __tablename__ = "notifications"

    id             = Column(String(36), primary_key=True,
                            default=lambda: str(uuid.uuid4()))
    hotel_id       = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    title          = Column(String(255), nullable=False)
    message        = Column(Text, nullable=False)
    type           = Column(String(50), nullable=False)
    entity_id      = Column(String(36), nullable=True)
    entity_type    = Column(String(50), nullable=True)
    recipient_role = Column(String(50), nullable=False, default="manager")
    is_read        = Column(Boolean, nullable=False, default=False)
    created_at     = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at     = Column(DateTime, default=datetime.utcnow,
                            onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_notifications_hotel_id", "hotel_id"),
        Index("ix_notifications_hotel_type", "hotel_id", "type"),
    )
