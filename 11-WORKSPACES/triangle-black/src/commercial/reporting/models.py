from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, Float
from src.core.base import Base

class Report(Base):
    __tablename__ = "reports"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    period = Column(String(50), nullable=False, default="monthly")
    metrics = Column(JSON, nullable=False, default=dict)
    total_leads = Column(Float, nullable=False, default=0.0)
    conversion_rate = Column(Float, nullable=False, default=0.0)
    revenue_pipeline = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
