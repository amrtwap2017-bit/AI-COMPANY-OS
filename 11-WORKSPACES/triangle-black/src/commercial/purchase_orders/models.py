from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""Purchase Order model — Triangle Black"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, JSON, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id            = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id      = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    po_number     = Column(String(50), nullable=False, unique=True)
    vendor_id     = Column(String(36), nullable=False)
    pr_id         = Column(String(36), nullable=True)
    status        = Column(String(50), nullable=False, default="draft")
    expected_date = Column(DateTime, nullable=True)
    lines         = Column(JSON, nullable=False, default=list)
    subtotal      = Column(Float, nullable=False, default=0)
    vat_amount    = Column(Float, nullable=False, default=0)
    total_amount  = Column(Float, nullable=False, default=0)
    payment_terms = Column(String(100), nullable=True)
    delivery_notes = Column(Text, nullable=True)
    approved_by   = Column(String(255), nullable=True)
    approved_at   = Column(DateTime, nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    __table_args__ = (
        Index("ix_purchase_orders_hotel_id", "hotel_id"),
        Index("ix_purchase_orders_vendor_id", "vendor_id"),
        Index("ix_purchase_orders_status", "status"),
    )
