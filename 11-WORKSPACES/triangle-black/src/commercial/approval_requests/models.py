"""approval_requests/models.py — Sprint-083"""
from sqlalchemy import Column, String, Text, DateTime, Float, Index
import uuid
from datetime import datetime, timezone
from src.core.base import Base

class ApprovalRequest(Base):
    __tablename__ = "approval_requests"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id = Column(String(36), nullable=True, index=True)
    entity_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(String(36), nullable=False, index=True)
    title = Column(String(300), nullable=True)
    amount = Column(Float, nullable=True)
    status = Column(String(50), nullable=False, default="pending", index=True)
    requested_by = Column(String(100), nullable=True)
    assigned_to = Column(String(100), nullable=True)
    priority = Column(String(20), nullable=True, default="normal")
    notes = Column(Text, nullable=True)
    requested_at = Column(DateTime, nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    resolved_at = Column(DateTime, nullable=True)
    __table_args__ = (
        Index("ix_approval_req_hotel_status", "hotel_id", "status"),
        {"extend_existing": True},
    )
