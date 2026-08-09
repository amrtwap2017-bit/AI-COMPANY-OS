"""scope_of_work/models.py — Sprint-082"""
from sqlalchemy import Column, String, Text, DateTime, Float, Integer, Index
import uuid
from datetime import datetime, timezone
from src.core.base import Base

class ScopeOfWork(Base):
    __tablename__ = "scope_of_work"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id = Column(String(36), nullable=True, index=True)
    contract_id = Column(String(36), nullable=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="draft", index=True)
    total_value = Column(Float, nullable=True, default=0)
    created_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at = Column(DateTime, nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    __table_args__ = (
        Index("ix_sow_hotel_status", "hotel_id", "status"),
        {"extend_existing": True},
    )
