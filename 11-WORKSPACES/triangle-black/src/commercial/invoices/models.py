"""
Invoice — Triangle Black
Auto-created when a contract is activated.
"""
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, Integer, Index
from src.core.base import Base

DEFAULT_HOTEL = "tb-default-hotel-000000000001"


class Invoice(Base):
    __tablename__ = "invoices"

    id             = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id       = Column(String(36), nullable=False, default=DEFAULT_HOTEL)
    invoice_number = Column(String(50), nullable=False, unique=True)
    contract_id    = Column(String(36), nullable=False)
    lead_id        = Column(String(36), nullable=False)
    title          = Column(String(255), nullable=False)
    description    = Column(Text, nullable=True)
    amount         = Column(Float, nullable=False, default=0.0)
    tax_amount     = Column(Float, nullable=False, default=0.0)
    total_amount   = Column(Float, nullable=False, default=0.0)
    status         = Column(String(50), nullable=False, default="draft")
    issue_date     = Column(DateTime, nullable=False, default=datetime.utcnow)
    due_date       = Column(DateTime, nullable=True)
    paid_date      = Column(DateTime, nullable=True)
    notes          = Column(Text, nullable=True)
    renewal_number = Column(Integer, nullable=False, default=0)
    created_at     = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at     = Column(DateTime, default=datetime.utcnow,
                            onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_invoices_hotel_id", "hotel_id"),
        Index("ix_invoices_contract_id", "contract_id"),
        Index("ix_invoices_lead_id", "lead_id"),
        Index("ix_invoices_status", "status"),
    )
