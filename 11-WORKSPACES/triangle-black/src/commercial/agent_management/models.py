from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text
from src.core.base import Base

class Agent(Base):
    __tablename__ = "agents"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    phone = Column(String(50), nullable=True)
    max_leads = Column(Integer, nullable=False, default=10)
    current_leads = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
