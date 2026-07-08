from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime
from src.core.base import Base

class Pipeline(Base):
    __tablename__ = "pipelines"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    stage = Column(String(50), nullable=False, default="new")
    lead_count = Column(Integer, nullable=False, default=0)
    total_value = Column(Float, nullable=False, default=0.0)
    conversion_rate = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
