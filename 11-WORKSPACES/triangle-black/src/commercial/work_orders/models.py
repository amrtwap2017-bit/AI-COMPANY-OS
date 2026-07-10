"""Work Order SQLAlchemy model — Triangle Black"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class WorkOrder(Base):
    __tablename__ = "work_orders"
    id                 = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id           = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    work_order_number  = Column(String(50), nullable=False, unique=True)
    contract_id        = Column(String(36), nullable=True)
    site_id            = Column(String(36), nullable=True)
    asset_id           = Column(String(36), nullable=True)
    technician_id      = Column(String(36), nullable=True)
    type               = Column(String(50), nullable=False, default="preventive_maintenance")
    priority           = Column(String(20), nullable=False, default="medium")
    status             = Column(String(50), nullable=False, default="draft")
    title              = Column(String(255), nullable=False)
    description        = Column(Text, nullable=True)
    scheduled_date     = Column(DateTime, nullable=True)
    started_at         = Column(DateTime, nullable=True)
    completed_at       = Column(DateTime, nullable=True)
    issue_summary      = Column(Text, nullable=True)
    resolution_summary = Column(Text, nullable=True)
    recommendations    = Column(Text, nullable=True)
    checklist          = Column(JSON, nullable=True, default=list)
    created_at         = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at         = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    __table_args__ = (
        Index("ix_work_orders_hotel_id", "hotel_id"),
        Index("ix_work_orders_contract_id", "contract_id"),
        Index("ix_work_orders_technician_id", "technician_id"),
        Index("ix_work_orders_status", "status"),
    )
