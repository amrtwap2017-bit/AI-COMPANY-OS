from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, JSON
from src.core.base import Base

class Quote(Base):
    __tablename__ = "quotes"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lead_id = Column(String(36), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    items = Column(JSON, nullable=False, default=list)
    total = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), nullable=False, default="draft")
    validity_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
