"""
Notification — Triangle Black
Auto-created on key business events. Role-based fan-out.
"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Boolean
from src.core.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    id             = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title          = Column(String(255), nullable=False)
    message        = Column(Text, nullable=False)
    type           = Column(String(50), nullable=False)          # lead_qualified | lead_assigned | quote_sent | quote_approved | quote_rejected
    entity_id      = Column(String(36), nullable=True)           # lead_id or quote_id
    entity_type    = Column(String(50), nullable=True)           # lead | quote
    recipient_role = Column(String(50), nullable=False, default="manager")  # agent | manager | admin | all
    is_read        = Column(Boolean, nullable=False, default=False)
    created_at     = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at     = Column(DateTime, default=datetime.utcnow,
                            onupdate=datetime.utcnow, nullable=False)
