"""Site SQLAlchemy model — Triangle Black"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class Site(Base):
    __tablename__ = "sites"
    id             = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id       = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    contract_id    = Column(String(36), nullable=True)
    lead_id        = Column(String(36), nullable=True)
    name           = Column(String(255), nullable=False)
    address        = Column(Text, nullable=True)
    city           = Column(String(100), nullable=True)
    contact_person = Column(String(255), nullable=True)
    contact_phone  = Column(String(50), nullable=True)
    notes          = Column(Text, nullable=True)
    is_active      = Column(Boolean, nullable=False, default=True)
    created_at     = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    __table_args__ = (
        Index("ix_sites_hotel_id", "hotel_id"),
        Index("ix_sites_contract_id", "contract_id"),
    )
