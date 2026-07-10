"""Service Request SQLAlchemy model — Triangle Black"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class ServiceRequest(Base):
    __tablename__ = "service_requests"
    id               = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id         = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    contract_id      = Column(String(36), nullable=True)
    site_id          = Column(String(36), nullable=True)
    work_order_id    = Column(String(36), nullable=True)
    submitted_by     = Column(String(255), nullable=True)
    contact_phone    = Column(String(50), nullable=True)
    category         = Column(String(100), nullable=False, default="general")
    urgency          = Column(String(20), nullable=False, default="normal")
    status           = Column(String(50), nullable=False, default="new")
    title            = Column(String(255), nullable=False)
    description      = Column(Text, nullable=True)
    preferred_date   = Column(DateTime, nullable=True)
    resolved_at      = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at       = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    __table_args__ = (
        Index("ix_service_requests_hotel_id", "hotel_id"),
        Index("ix_service_requests_contract_id", "contract_id"),
        Index("ix_service_requests_status", "status"),
    )
