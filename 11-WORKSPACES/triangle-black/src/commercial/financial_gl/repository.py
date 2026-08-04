from __future__ import annotations
import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from .models import JournalEntry

DEFAULT_HOTEL = "tb-default-hotel-000000000001"

class JournalRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict, hotel_id: str = DEFAULT_HOTEL) -> JournalEntry:
        count = self.db.query(JournalEntry).filter(JournalEntry.hotel_id == hotel_id).count()
        obj = JournalEntry(id=str(uuid.uuid4()), hotel_id=hotel_id,
            entry_number=f"JE-{datetime.utcnow().strftime('%Y%m')}-{count+1:04d}",
            created_at=datetime.utcnow(), updated_at=datetime.utcnow(), **data)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def list(self, hotel_id: str = DEFAULT_HOTEL, skip: int = 0, limit: int = 100) -> List[JournalEntry]:
        return self.db.query(JournalEntry).filter(
            JournalEntry.hotel_id == hotel_id, JournalEntry.is_active == True
        ).order_by(JournalEntry.entry_date.desc()).offset(skip).limit(limit).all()

    def get(self, obj_id: str, hotel_id: str = DEFAULT_HOTEL) -> Optional[JournalEntry]:
        return self.db.query(JournalEntry).filter(
            JournalEntry.id == obj_id, JournalEntry.hotel_id == hotel_id).first()

    def summary(self, hotel_id: str = DEFAULT_HOTEL) -> dict:
        from sqlalchemy import func
        total_dr = self.db.query(func.sum(JournalEntry.total_debit)).filter(
            JournalEntry.hotel_id == hotel_id).scalar() or 0.0
        total_cr = self.db.query(func.sum(JournalEntry.total_credit)).filter(
            JournalEntry.hotel_id == hotel_id).scalar() or 0.0
        count = self.db.query(JournalEntry).filter(JournalEntry.hotel_id == hotel_id).count()
        return {"total_entries": count, "total_debit": total_dr,
                "total_credit": total_cr, "balance": total_dr - total_cr}
