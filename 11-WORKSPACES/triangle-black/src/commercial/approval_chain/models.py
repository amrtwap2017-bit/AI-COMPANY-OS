"""approval_chain/models.py — Sprint-083"""
from sqlalchemy import Column, String, Text, DateTime, Index
import uuid
from datetime import datetime, timezone
from src.core.base import Base

class PRApprovalChain(Base):
    __tablename__ = "pr_approval_chain"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pr_id = Column(String(36), nullable=False, index=True)
    hotel_id = Column(String(36), nullable=True, index=True)
    approver_id = Column(String(100), nullable=True)
    approver_name = Column(String(200), nullable=True)
    action = Column(String(50), nullable=False, default="pending")
    notes = Column(Text, nullable=True)
    actioned_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    __table_args__ = (
        Index("ix_pr_approval_chain_pr", "pr_id"),
        {"extend_existing": True},
    )
