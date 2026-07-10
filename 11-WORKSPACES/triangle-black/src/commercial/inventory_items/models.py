"""Inventory Item model — Triangle Black"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Float, Integer, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    id                  = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id            = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    item_code           = Column(String(100), nullable=False)
    name                = Column(String(255), nullable=False)
    name_ar             = Column(String(255), nullable=True)
    category            = Column(String(100), nullable=False, default="general")
    subcategory         = Column(String(100), nullable=True)
    brand               = Column(String(255), nullable=True)
    model               = Column(String(255), nullable=True)
    unit_of_measure     = Column(String(50), nullable=False, default="piece")
    item_type           = Column(String(50), nullable=False, default="spare_part")
    is_stockable        = Column(Boolean, nullable=False, default=True)
    preferred_vendor_id = Column(String(36), nullable=True)
    min_stock           = Column(Float, nullable=False, default=0)
    max_stock           = Column(Float, nullable=False, default=0)
    reorder_qty         = Column(Float, nullable=False, default=0)
    lead_time_days      = Column(Integer, nullable=False, default=7)
    standard_cost       = Column(Float, nullable=False, default=0)
    last_purchase_cost  = Column(Float, nullable=False, default=0)
    average_cost        = Column(Float, nullable=False, default=0)
    vat_pct             = Column(Float, nullable=False, default=14)
    is_active           = Column(Boolean, nullable=False, default=True)
    notes               = Column(Text, nullable=True)
    created_at          = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at          = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    __table_args__ = (
        Index("ix_inventory_items_hotel_id", "hotel_id"),
        Index("ix_inventory_items_category", "hotel_id", "category"),
    )
