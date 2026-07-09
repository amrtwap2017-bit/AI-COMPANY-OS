"""
Hotels FastAPI router — Triangle Black
Hotels are top-level tenants — admin-only operations, no hotel_id scoping.
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_agent, require_manager
from src.commercial.auth.models import User
from .schemas import HotelCreate, HotelUpdate, HotelResponse
from .repository import HotelRepository

router = APIRouter(prefix="/hotels", tags=["hotels"])


@router.post("/", response_model=HotelResponse, status_code=201)
def create(
    payload: HotelCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    return HotelRepository(db).create(payload.model_dump())


@router.get("/", response_model=List[HotelResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
):
    return HotelRepository(db).list(skip=skip, limit=limit, active_only=active_only)


@router.get("/{hotel_id}", response_model=HotelResponse)
def get(
    hotel_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
):
    obj = HotelRepository(db).get(hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return obj


@router.patch("/{hotel_id}", response_model=HotelResponse)
def update(
    hotel_id: str,
    payload: HotelUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    obj = HotelRepository(db).update(
        hotel_id, payload.model_dump(exclude_none=True)
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return obj


@router.delete("/{hotel_id}", status_code=204)
def delete(
    hotel_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    if not HotelRepository(db).delete(hotel_id):
        raise HTTPException(status_code=404, detail="Hotel not found")
