"""suppliers/models.py — Sprint-081"""
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, Index
import uuid
from datetime import datetime, timezone
from src.core.base import Base, SoftDeleteMixin

class Supplier(SoftDeleteMixin, Base):
    __tablename__ = "suppliers"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id = Column(String(36), nullable=False, index=True)
    supplier_code = Column(String(50), nullable=True)
    company_name = Column(String(200), nullable=False)
    arabic_name = Column(String(200), nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)
    supplier_type = Column(String(100), nullable=True)
    payment_terms = Column(String(50), nullable=True)
    lead_time_days = Column(Integer, nullable=True, default=7)
    preferred_flag = Column(String(10), nullable=True, default="False")
    risk_level = Column(String(20), nullable=True, default="low")
    notes = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True, default="Egypt")
    phone = Column(String(50), nullable=True)
    email = Column(String(200), nullable=True)
    category = Column(String(100), nullable=True)
    contact_person = Column(String(200), nullable=True)
    credit_limit = Column(Float, nullable=True, default=0)
    blacklisted = Column(String(10), nullable=True, default="False")
    is_approved = Column(String(10), nullable=True, default="False")
    rating = Column(Float, nullable=True, default=0)
    created_at = Column(DateTime, nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at = Column(DateTime, nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    __table_args__ = (
        Index("ix_suppliers_hotel_status", "hotel_id", "status"),
        {"extend_existing": True},
    )
