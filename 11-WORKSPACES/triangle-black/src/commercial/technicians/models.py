from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""Technician SQLAlchemy model — Triangle Black"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class Technician(Base):
    __tablename__ = "technicians"
    id                  = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id            = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    name                = Column(String(255), nullable=False)
    email               = Column(String(255), nullable=False)
    phone               = Column(String(50), nullable=True)
    specializations     = Column(JSON, nullable=False, default=list)
    max_work_orders     = Column(Integer, nullable=False, default=10)
    current_work_orders = Column(Integer, nullable=False, default=0)
    is_active           = Column(Boolean, nullable=False, default=True)
    notes               = Column(Text, nullable=True)
    created_at          = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at          = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    __table_args__ = (Index("ix_technicians_hotel_id", "hotel_id"),)
