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
