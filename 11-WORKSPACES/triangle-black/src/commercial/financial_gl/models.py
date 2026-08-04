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


# ── Sprint-016: Chart of Accounts ────────────────────────────────────────────
class ChartOfAccount(Base):
    __tablename__ = "chart_of_accounts"

    id                  = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id            = Column(String(36), nullable=False, index=True)
    account_code        = Column(String(20),  nullable=False)
    account_name        = Column(String(200), nullable=False)
    account_type        = Column(String(50),  nullable=False)  # asset/liability/equity/revenue/expense
    parent_account_code = Column(String(20),  nullable=True)
    description         = Column(Text,        nullable=True)
    is_active           = Column(Boolean,     nullable=False, default=True)
    created_at          = Column(TIMESTAMP,   server_default=func.now(), nullable=False)
    updated_at          = Column(TIMESTAMP,   server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_coa_hotel",   "hotel_id"),
        Index("idx_coa_code",    "account_code"),
        Index("idx_coa_type",    "account_type"),
    )
# ─────────────────────────────────────────────────────────────────────────────
