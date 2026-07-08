"""
Quote FastAPI router — Triangle Black
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from .schemas import QuoteCreate, QuoteUpdate, QuoteResponse
from .repository import QuoteRepository

router = APIRouter(prefix="/quotes", tags=["quotes"])


@router.post("/", response_model=QuoteResponse, status_code=201)
def create(payload: QuoteCreate, db: Session = Depends(get_db)):
    return QuoteRepository(db).create(payload.model_dump())


@router.get("/", response_model=List[QuoteResponse])
def list_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return QuoteRepository(db).list(skip=skip, limit=limit)


@router.get("/{quote_id}", response_model=QuoteResponse)
def get(quote_id: str, db: Session = Depends(get_db)):
    obj = QuoteRepository(db).get(quote_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Quote not found")
    return obj


@router.patch("/{quote_id}", response_model=QuoteResponse)
def update(quote_id: str, payload: QuoteUpdate, db: Session = Depends(get_db)):
    obj = QuoteRepository(db).update(quote_id, payload.model_dump(exclude_none=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Quote not found")
    return obj


@router.delete("/{quote_id}", status_code=204)
def delete(quote_id: str, db: Session = Depends(get_db)):
    if not QuoteRepository(db).delete(quote_id):
        raise HTTPException(status_code=404, detail="Quote not found")
