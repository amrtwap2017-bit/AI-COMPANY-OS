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
