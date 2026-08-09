"""procurement_intake/models.py — Sprint-082"""
from sqlalchemy import Column, String, Text, DateTime, Float, Integer, Index
import uuid
from datetime import datetime, timezone
from src.core.base import Base

class ProcurementIntakeLog(Base):
    __tablename__ = "procurement_intake_log"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id = Column(String(36), nullable=False, index=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(36), nullable=True)
    details = Column(Text, nullable=True)
    actor_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    __table_args__ = (
        Index("ix_procurement_log_hotel", "hotel_id"),
        {"extend_existing": True},
    )
