"""Inventory Vendor model — Triangle Black"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class InventoryVendor(Base):
    __tablename__ = "inventory_vendors"
    id             = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id       = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    vendor_code    = Column(String(50), nullable=False)
    name           = Column(String(255), nullable=False)
    name_ar        = Column(String(255), nullable=True)
    category       = Column(String(100), nullable=True)
    contact_person = Column(String(255), nullable=True)
    phone          = Column(String(50), nullable=True)
    email          = Column(String(255), nullable=True)
    tax_number     = Column(String(100), nullable=True)
    payment_terms  = Column(String(100), nullable=True, default="net30")
    lead_time_days = Column(Integer, nullable=True, default=7)
    rating         = Column(Integer, nullable=True, default=5)
    is_active      = Column(Boolean, nullable=False, default=True)
    notes          = Column(Text, nullable=True)
    created_at     = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    __table_args__ = (Index("ix_inventory_vendors_hotel_id", "hotel_id"),)
