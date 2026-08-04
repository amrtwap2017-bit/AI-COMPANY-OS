from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .repository import JournalRepository
from .schemas import JournalEntryCreate, JournalEntryResponse

router = APIRouter(prefix="/financial/gl", tags=["financial-gl"])

@router.get("/", response_model=List[JournalEntryResponse])
def list_entries(hotel_id: str = Depends(get_hotel_id), skip: int = 0, limit: int = 100,
                 db: Session = Depends(get_db)):
    return JournalRepository(db).list(hotel_id, skip, limit)

@router.post("/", response_model=JournalEntryResponse, status_code=201)
def create_entry(payload: JournalEntryCreate, hotel_id: str = Depends(get_hotel_id),
                 db: Session = Depends(get_db)):
    return JournalRepository(db).create(payload.model_dump(exclude_none=True), hotel_id)

@router.get("/summary")
def get_summary(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db)):
    return JournalRepository(db).summary(hotel_id)

@router.get("/{entry_id}", response_model=JournalEntryResponse)
def get_entry(entry_id: str, hotel_id: str = Depends(get_hotel_id),
              db: Session = Depends(get_db)):
    obj = JournalRepository(db).get(entry_id, hotel_id)
    if not obj: raise HTTPException(404, "Entry not found")
    return obj


# ── Sprint-016: Chart of Accounts Endpoints ───────────────────────────────────
from src.commercial.financial_gl.schemas import (
    AccountCreate, AccountUpdate, AccountOut, AccountListResponse
)

@router.get("/accounts/", response_model=AccountListResponse)
def list_accounts(
    account_type: str = None,
    is_active: bool = None,
    limit: int = 100,
    offset: int = 0,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    total, items = repo.list_accounts(db, hotel_id, account_type, is_active, limit, offset)
    return AccountListResponse(count=total, results=items)


@router.post("/accounts/", response_model=AccountOut, status_code=201)
def create_account(
    data: AccountCreate,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return repo.create_account(db, hotel_id, data)


@router.get("/accounts/{account_id}", response_model=AccountOut)
def get_account(
    account_id: str,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    acc = repo.get_account(db, hotel_id, account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    return acc


@router.patch("/accounts/{account_id}", response_model=AccountOut)
def update_account(
    account_id: str,
    data: AccountUpdate,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    acc = repo.update_account(db, hotel_id, account_id, data)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    return acc
# ─────────────────────────────────────────────────────────────────────────────
