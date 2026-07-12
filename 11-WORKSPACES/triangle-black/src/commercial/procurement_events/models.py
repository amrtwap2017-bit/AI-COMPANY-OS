from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""Procurement Event (Audit Log) model — Triangle Black"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class ProcurementEvent(Base):
    __tablename__ = "procurement_events"
    id          = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id    = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    entity_type = Column(String(50), nullable=False)
    entity_id   = Column(String(36), nullable=False)
    event_type  = Column(String(100), nullable=False)
    old_value   = Column(Text, nullable=True)
    new_value   = Column(Text, nullable=True)
    comment     = Column(Text, nullable=True)
    created_by  = Column(String(255), nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)
    __table_args__ = (
        Index("ix_procurement_events_hotel_id", "hotel_id"),
        Index("ix_procurement_events_entity", "entity_type", "entity_id"),
    )
