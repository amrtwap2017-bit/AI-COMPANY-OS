from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""Service Report SQLAlchemy model — Triangle Black"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class ServiceReport(Base):
    __tablename__ = "service_reports"
    id                  = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id            = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    work_order_id       = Column(String(36), nullable=False)
    contract_id         = Column(String(36), nullable=True)
    site_id             = Column(String(36), nullable=True)
    asset_id            = Column(String(36), nullable=True)
    technician_id       = Column(String(36), nullable=True)
    work_performed      = Column(Text, nullable=True)
    findings            = Column(Text, nullable=True)
    parts_used          = Column(JSON, nullable=True, default=list)
    recommendations     = Column(Text, nullable=True)
    follow_up_required  = Column(Boolean, nullable=False, default=False)
    follow_up_notes     = Column(Text, nullable=True)
    client_acknowledged = Column(Boolean, nullable=False, default=False)
    client_name         = Column(String(255), nullable=True)
    created_at          = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at          = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    __table_args__ = (
        Index("ix_service_reports_hotel_id", "hotel_id"),
        Index("ix_service_reports_work_order_id", "work_order_id"),
        Index("ix_service_reports_contract_id", "contract_id"),
    )
