from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""RFQ models — Triangle Black"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Float, Integer, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class RFQ(Base):
    __tablename__ = "rfqs"
    id            = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id      = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    rfq_number    = Column(String(50), nullable=False, unique=True)
    pr_id         = Column(String(36), nullable=True)
    title         = Column(String(255), nullable=False)
    status        = Column(String(50), nullable=False, default="draft")
    required_date = Column(DateTime, nullable=True)
    lines         = Column(JSON, nullable=False, default=list)
    notes         = Column(Text, nullable=True)
    created_by    = Column(String(255), nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    __table_args__ = (
        Index("ix_rfqs_hotel_id", "hotel_id"),
        Index("ix_rfqs_status", "status"),
    )

class RFQVendorQuote(Base):
    __tablename__ = "rfq_vendor_quotes"
    id             = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id       = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    rfq_id         = Column(String(36), nullable=False)
    vendor_id      = Column(String(36), nullable=False)
    status         = Column(String(50), nullable=False, default="invited")
    lines          = Column(JSON, nullable=False, default=list)
    subtotal       = Column(Float, nullable=False, default=0)
    vat_amount     = Column(Float, nullable=False, default=0)
    total_amount   = Column(Float, nullable=False, default=0)
    lead_time_days = Column(Integer, nullable=True)
    validity_date  = Column(DateTime, nullable=True)
    notes          = Column(Text, nullable=True)
    is_winner      = Column(Boolean, nullable=False, default=False)
    created_at     = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    __table_args__ = (
        Index("ix_rfq_vendor_quotes_rfq_id", "rfq_id"),
        Index("ix_rfq_vendor_quotes_hotel_id", "hotel_id"),
    )
