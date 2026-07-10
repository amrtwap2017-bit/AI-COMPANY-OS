"""Goods Receipt model — Triangle Black"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class GoodsReceipt(Base):
    __tablename__ = "goods_receipts"
    id            = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id      = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    grn_number    = Column(String(50), nullable=False, unique=True)
    po_id         = Column(String(36), nullable=True)
    vendor_id     = Column(String(36), nullable=True)
    warehouse_id  = Column(String(36), nullable=False)
    received_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    status        = Column(String(50), nullable=False, default="draft")
    lines         = Column(JSON, nullable=False, default=list)
    notes         = Column(Text, nullable=True)
    received_by   = Column(String(255), nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    __table_args__ = (
        Index("ix_goods_receipts_hotel_id", "hotel_id"),
        Index("ix_goods_receipts_po_id", "po_id"),
    )
