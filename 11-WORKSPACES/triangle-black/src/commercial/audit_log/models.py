"""
audit_log/models.py — Sprint-070: DDD compliance
Maps to platform_audit_log table created inline by router.py
hotel_id: NON-NEGOTIABLE multi-tenancy key
"""
from sqlalchemy import Column, String, Text, DateTime, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from src.core.base import Base


class AuditLog(Base):
    """
    Platform audit log — tracks every significant action.
    Table created inline by router._ensure_audit_table()
    This model enables ORM access and type safety.
    """
    __tablename__ = "platform_audit_log"

    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    hotel_id = Column(String(36), nullable=True, index=True,
                      comment="Multi-tenancy key")
    entity_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(String(36), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    actor_id = Column(String(100), nullable=True)
    actor_name = Column(String(200), nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    event_metadata = Column("metadata", Text, nullable=True)
    created_at = Column(
        DateTime(timezone=False), nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )

    __table_args__ = (
        Index("ix_audit_log_hotel_entity", "hotel_id", "entity_type"),
        Index("ix_audit_log_created", "created_at"),
        {"extend_existing": True},
    )
