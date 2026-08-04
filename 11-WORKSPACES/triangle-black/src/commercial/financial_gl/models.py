from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, Text
from src.core.base import Base

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id           = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id     = Column(String(36), nullable=False, index=True)
    entry_number = Column(String(50), nullable=True)
    entry_date   = Column(DateTime, nullable=False, default=datetime.utcnow)
    description  = Column(Text, nullable=True)
    reference    = Column(String(100), nullable=True)
    total_debit  = Column(Float, nullable=False, default=0.0)
    total_credit = Column(Float, nullable=False, default=0.0)
    status       = Column(String(20), nullable=False, default="draft")
    is_active    = Column(Boolean, default=True)
    created_at   = Column(DateTime, default=datetime.utcnow)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
