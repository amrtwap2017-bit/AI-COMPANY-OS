"""Purchase Request model — Triangle Black"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class PurchaseRequest(Base):
    __tablename__ = "purchase_requests"
    id             = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id       = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    pr_number      = Column(String(50), nullable=False, unique=True)
    requester      = Column(String(255), nullable=False)
    department     = Column(String(100), nullable=True)
    urgency        = Column(String(20), nullable=False, default="normal")
    required_date  = Column(DateTime, nullable=True)
    contract_id    = Column(String(36), nullable=True)
    project_ref    = Column(String(255), nullable=True)
    status         = Column(String(50), nullable=False, default="draft")
    justification  = Column(Text, nullable=True)
    lines          = Column(JSON, nullable=False, default=list)
    approved_by    = Column(String(255), nullable=True)
    approved_at    = Column(DateTime, nullable=True)
    rejection_note = Column(Text, nullable=True)
    created_at     = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    __table_args__ = (
        Index("ix_purchase_requests_hotel_id", "hotel_id"),
        Index("ix_purchase_requests_status", "status"),
    )
