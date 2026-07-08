from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from src.core.base import Base

class Activity(Base):
    __tablename__ = "activities"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lead_id = Column(String(36), nullable=False)
    type = Column(String(50), nullable=False, default="note")
    description = Column(Text, nullable=False)
    actor = Column(String(255), nullable=False, default="system")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
