"""Asset SQLAlchemy model — Triangle Black"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class Asset(Base):
    __tablename__ = "assets"
    id                   = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id             = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    site_id              = Column(String(36), nullable=False)
    category             = Column(String(100), nullable=False)
    name                 = Column(String(255), nullable=False)
    manufacturer         = Column(String(255), nullable=True)
    model                = Column(String(255), nullable=True)
    serial_number        = Column(String(100), nullable=True)
    location_description = Column(Text, nullable=True)
    service_frequency    = Column(String(50), nullable=True, default="monthly")
    installation_date    = Column(DateTime, nullable=True)
    warranty_expiry      = Column(DateTime, nullable=True)
    criticality          = Column(String(20), nullable=False, default="medium")
    status               = Column(String(50), nullable=False, default="operational")
    notes                = Column(Text, nullable=True)
    created_at           = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at           = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    __table_args__ = (
        Index("ix_assets_hotel_id", "hotel_id"),
        Index("ix_assets_site_id", "site_id"),
    )
