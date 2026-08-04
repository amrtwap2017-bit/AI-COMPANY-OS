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


# ── Sprint-016: Chart of Accounts Repository ─────────────────────────────────
from src.commercial.financial_gl.models import ChartOfAccount
from src.commercial.financial_gl.schemas import AccountCreate, AccountUpdate

def create_account(db: Session, hotel_id: str, data: AccountCreate) -> ChartOfAccount:
    acc = ChartOfAccount(
        id=str(uuid.uuid4()),
        hotel_id=hotel_id,
        account_code=data.account_code,
        account_name=data.account_name,
        account_type=data.account_type,
        parent_account_code=data.parent_account_code,
        description=data.description,
        is_active=data.is_active,
    )
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return acc

def get_account(db: Session, hotel_id: str, account_id: str):
    return db.query(ChartOfAccount).filter(
        ChartOfAccount.id == account_id,
        ChartOfAccount.hotel_id == hotel_id
    ).first()

def list_accounts(db: Session, hotel_id: str, account_type: str = None,
                  is_active: bool = None, limit: int = 100, offset: int = 0):
    q = db.query(ChartOfAccount).filter(ChartOfAccount.hotel_id == hotel_id)
    if account_type:
        q = q.filter(ChartOfAccount.account_type == account_type)
    if is_active is not None:
        q = q.filter(ChartOfAccount.is_active == is_active)
    total = q.count()
    items = q.order_by(ChartOfAccount.account_code).offset(offset).limit(limit).all()
    return total, items

def update_account(db: Session, hotel_id: str, account_id: str, data: AccountUpdate):
    acc = get_account(db, hotel_id, account_id)
    if not acc:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(acc, field, value)
    db.commit()
    db.refresh(acc)
    return acc
# ─────────────────────────────────────────────────────────────────────────────
