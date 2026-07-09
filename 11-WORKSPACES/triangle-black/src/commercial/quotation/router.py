"""
Quote FastAPI router — Triangle Black
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_agent, require_manager
from src.core.tenant import get_hotel_id
from src.commercial.auth.models import User
from .schemas import QuoteCreate, QuoteUpdate, QuoteResponse
from .repository import QuoteRepository

router = APIRouter(prefix="/quotes", tags=["quotes"])


@router.post("/", response_model=QuoteResponse, status_code=201)
def create(
    payload: QuoteCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return QuoteRepository(db).create(data)


@router.get("/", response_model=List[QuoteResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return QuoteRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)


@router.get("/{quote_id}", response_model=QuoteResponse)
def get(
    quote_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = QuoteRepository(db).get(quote_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Quote not found")
    return obj


@router.patch("/{quote_id}", response_model=QuoteResponse)
def update(
    quote_id: str,
    payload: QuoteUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = QuoteRepository(db).update(
        quote_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Quote not found")
    return obj


@router.delete("/{quote_id}", status_code=204)
def delete(
    quote_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not QuoteRepository(db).delete(quote_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="Quote not found")
