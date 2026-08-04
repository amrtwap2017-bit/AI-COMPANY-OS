from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, Text, JSON
from src.core.base import Base

class ETAInvoice(Base):
    __tablename__ = "eta_invoices"
    id              = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id        = Column(String(36), nullable=False, index=True)
    invoice_id      = Column(String(36), nullable=True)
    invoice_number  = Column(String(50), nullable=True)
    eta_uuid        = Column(String(100), nullable=True)
    eta_status      = Column(String(30), nullable=False, default="pending")
    submission_date = Column(DateTime, nullable=True)
    total_amount    = Column(Float, nullable=False, default=0.0)
    tax_amount      = Column(Float, nullable=False, default=0.0)
    buyer_name      = Column(String(200), nullable=True)
    buyer_tax_id    = Column(String(50), nullable=True)
    raw_payload     = Column(JSON, nullable=True)
    eta_response    = Column(JSON, nullable=True)
    error_message   = Column(Text, nullable=True)
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
