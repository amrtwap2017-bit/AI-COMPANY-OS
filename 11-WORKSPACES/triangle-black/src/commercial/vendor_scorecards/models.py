from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""Vendor Scorecard model — Triangle Black"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class VendorScorecard(Base):
    __tablename__ = "vendor_scorecards"
    id                 = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id           = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    vendor_id          = Column(String(36), nullable=False, unique=True)
    total_pos          = Column(Integer, nullable=False, default=0)
    total_spend        = Column(Float, nullable=False, default=0)
    on_time_deliveries = Column(Integer, nullable=False, default=0)
    late_deliveries    = Column(Integer, nullable=False, default=0)
    partial_deliveries = Column(Integer, nullable=False, default=0)
    rejected_receipts  = Column(Integer, nullable=False, default=0)
    avg_lead_time_days = Column(Float, nullable=True)
    on_time_pct        = Column(Float, nullable=True)
    quality_score      = Column(Float, nullable=False, default=5.0)
    price_score        = Column(Float, nullable=False, default=5.0)
    overall_score      = Column(Float, nullable=False, default=5.0)
    last_po_date       = Column(DateTime, nullable=True)
    updated_at         = Column(DateTime, default=datetime.utcnow, nullable=False)
    __table_args__ = (
        Index("ix_vendor_scorecards_hotel_id", "hotel_id"),
        Index("ix_vendor_scorecards_vendor_id", "vendor_id"),
    )
