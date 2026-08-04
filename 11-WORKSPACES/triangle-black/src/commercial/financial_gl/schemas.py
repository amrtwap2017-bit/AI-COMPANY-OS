from __future__ import annotations
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JournalEntryCreate(BaseModel):
    description: Optional[str] = None
    reference: Optional[str] = None
    entry_date: Optional[datetime] = None
    total_debit: float = 0.0
    total_credit: float = 0.0

class JournalEntryResponse(BaseModel):
    id: str
    hotel_id: str
    entry_number: Optional[str]
    entry_date: datetime
    description: Optional[str]
    reference: Optional[str]
    total_debit: float
    total_credit: float
    status: str
    created_at: datetime
    class Config:
        from_attributes = True


# ── Sprint-016: Chart of Accounts Schemas ────────────────────────────────────
from typing import Optional, List
from datetime import datetime

ACCOUNT_TYPES = ["asset", "liability", "equity", "revenue", "expense"]

class AccountCreate(BaseModel):
    account_code:        str
    account_name:        str
    account_type:        str
    parent_account_code: Optional[str] = None
    description:         Optional[str] = None
    is_active:           bool = True

class AccountUpdate(BaseModel):
    account_name:        Optional[str] = None
    account_type:        Optional[str] = None
    parent_account_code: Optional[str] = None
    description:         Optional[str] = None
    is_active:           Optional[bool] = None

class AccountOut(BaseModel):
    id:                  str
    hotel_id:            str
    account_code:        str
    account_name:        str
    account_type:        str
    parent_account_code: Optional[str]
    description:         Optional[str]
    is_active:           bool
    created_at:          datetime
    updated_at:          datetime

    class Config:
        from_attributes = True

class AccountListResponse(BaseModel):
    count:   int
    results: List[AccountOut]
# ─────────────────────────────────────────────────────────────────────────────
