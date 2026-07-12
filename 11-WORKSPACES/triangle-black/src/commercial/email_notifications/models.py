from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""
EmailNotification SQLAlchemy model — Triangle Black
Stores sent email audit log with hotel_id tenant isolation.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Boolean, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class EmailNotification(Base):
    __tablename__ = "email_notifications"

    id         = Column(String(36), primary_key=True,
                        default=lambda: str(uuid.uuid4()))
    hotel_id   = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    recipient  = Column(String(255), nullable=False)
    subject    = Column(String(500), nullable=False)
    body       = Column(Text,        nullable=False)
    status     = Column(String(50),  nullable=False, default="pending")
    sent_at    = Column(DateTime,    nullable=True)
    error_msg  = Column(Text,        nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_email_notifications_hotel_id", "hotel_id"),
        Index("ix_email_notifications_hotel_status", "hotel_id", "status"),
    )
