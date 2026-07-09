"""
Hotel SQLAlchemy model — Triangle Black
Matches the actual hotels table schema in the DB.
Hotels ARE the top-level tenants.
"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Index
from src.core.base import Base


class Hotel(Base):
    __tablename__ = "hotels"

    id         = Column(String(36), primary_key=True,
                        default=lambda: str(uuid.uuid4()))
    name       = Column(String(255), nullable=False)
    slug       = Column(String(100), nullable=False, unique=True)
    brand      = Column(String(255), nullable=True)
    city       = Column(String(100), nullable=True)
    country    = Column(String(100), nullable=True)
    address    = Column(String(500), nullable=True)
    phone      = Column(String(50),  nullable=True)
    email      = Column(String(255), nullable=True)
    rooms      = Column(String(20),  nullable=True)
    stars      = Column(String(5),   nullable=True)
    is_active  = Column(Boolean,     nullable=False, default=True)
    settings   = Column(JSON,        nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)
