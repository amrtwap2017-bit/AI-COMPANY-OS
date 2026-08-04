from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, Integer
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class Employee(Base):
    __tablename__ = "employees"
    id            = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id      = Column(String(36), nullable=False, index=True)
    name          = Column(String(200), nullable=False)
    email         = Column(String(200), nullable=True)
    phone         = Column(String(50), nullable=True)
    department    = Column(String(100), nullable=True)
    position      = Column(String(100), nullable=True)
    employee_id   = Column(String(50), nullable=True)
    status        = Column(String(20), nullable=False, default="active")
    hire_date     = Column(DateTime, nullable=True)
    salary        = Column(Float, nullable=True)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
