"""
notification_engine/models.py — Sprint-070: DDD compliance
Maps to platform_notifications table created inline by router.py
hotel_id: NON-NEGOTIABLE multi-tenancy key
"""
from sqlalchemy import Column, String, Text, DateTime, Boolean, Index
import uuid
from datetime import datetime, timezone
from src.core.base import Base


class PlatformNotification(Base):
    """
    Platform notification entity.
    Table created inline by router._ensure_notif_table()
    This model enables ORM access and type safety.
    """
    __tablename__ = "platform_notifications"

    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    hotel_id = Column(String(36), nullable=True, index=True)
    user_id = Column(String(36), nullable=True, index=True)
    type = Column(String(50), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=True)
    priority = Column(String(20), nullable=False, default="medium")
    is_read = Column(Boolean, nullable=False, default=False)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(36), nullable=True)
    action_url = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=False), nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )

    __table_args__ = (
        Index("ix_platform_notif_hotel_user", "hotel_id", "user_id"),
        Index("ix_platform_notif_read", "is_read"),
        {"extend_existing": True},
    )
