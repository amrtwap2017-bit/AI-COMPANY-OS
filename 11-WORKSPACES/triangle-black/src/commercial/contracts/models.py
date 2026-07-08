"""
Contract — Triangle Black
Created automatically when a quote is approved.
"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Integer, JSON, Text, Boolean
from src.core.base import Base


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quote_id = Column(String(36), nullable=False)
    lead_id = Column(String(36), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    services = Column(JSON, nullable=False, default=list)
    total_value = Column(Float, nullable=False, default=0.0)
    monthly_value = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), nullable=False, default="pending_signature")
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    duration_months = Column(Integer, nullable=False, default=12)
    renewal_count = Column(Integer, nullable=False, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)
