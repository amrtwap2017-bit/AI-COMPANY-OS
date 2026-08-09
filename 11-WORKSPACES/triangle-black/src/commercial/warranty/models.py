"""warranty/models.py — Sprint-081"""
from sqlalchemy import Column, String, Text, DateTime, Index
import uuid
from datetime import datetime, timezone
from src.core.base import Base

class AssetWarranty(Base):
    __tablename__ = "asset_warranties"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id = Column(String(36), nullable=False, index=True)
    asset_id = Column(String(36), nullable=False, index=True)
    asset_name = Column(String(200), nullable=True)
    vendor_name = Column(String(200), nullable=True)
    warranty_type = Column(String(50), nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    coverage_details = Column(Text, nullable=True)
    contact_info = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at = Column(DateTime, nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    __table_args__ = (
        Index("ix_warranty_hotel_asset", "hotel_id", "asset_id"),
        {"extend_existing": True},
    )
