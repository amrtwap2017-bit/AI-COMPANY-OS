"""Stock Movement model — Triangle Black"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class StockMovement(Base):
    __tablename__ = "stock_movements"
    id              = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id        = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    movement_number = Column(String(50), nullable=False, unique=True)
    item_id         = Column(String(36), nullable=False)
    warehouse_id    = Column(String(36), nullable=False)
    movement_type   = Column(String(50), nullable=False)
    qty             = Column(Float, nullable=False)
    unit_cost       = Column(Float, nullable=False, default=0)
    total_cost      = Column(Float, nullable=False, default=0)
    qty_before      = Column(Float, nullable=False, default=0)
    qty_after       = Column(Float, nullable=False, default=0)
    reference_type  = Column(String(50), nullable=True)
    reference_id    = Column(String(36), nullable=True)
    reason          = Column(String(255), nullable=True)
    notes           = Column(Text, nullable=True)
    created_by      = Column(String(255), nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow, nullable=False)
    __table_args__ = (
        Index("ix_stock_movements_hotel_id", "hotel_id"),
        Index("ix_stock_movements_item_id", "item_id"),
    )
