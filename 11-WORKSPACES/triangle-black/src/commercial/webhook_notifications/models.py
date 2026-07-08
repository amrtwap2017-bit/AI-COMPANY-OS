from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, JSON
from src.core.base import Base

class WebhookConfig(Base):
    __tablename__ = "webhookconfigs"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    events = Column(JSON, nullable=False, default=list)
    is_active = Column(Boolean, nullable=False, default=True)
    secret = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
