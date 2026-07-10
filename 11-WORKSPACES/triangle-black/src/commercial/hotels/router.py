"""
Hotel FastAPI router — Triangle Black
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_agent, require_manager
from src.core.tenant import get_hotel_id
from src.commercial.auth.models import User
from .schemas import HotelCreate, HotelUpdate, HotelResponse
from .repository import HotelRepository

router = APIRouter(prefix="/hotels", tags=["hotels"])


@router.post("/", response_model=HotelResponse, status_code=201)
def create(
    payload: HotelCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return HotelRepository(db).create(data)


@router.get("/", response_model=List[HotelResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return HotelRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)


@router.get("/{hotel_id}", response_model=HotelResponse)
def get(
    hotel_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = HotelRepository(db).get(hotel_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return obj


@router.patch("/{hotel_id}", response_model=HotelResponse)
def update(
    hotel_id: str,
    payload: HotelUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = HotelRepository(db).update(
        hotel_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return obj


@router.delete("/{hotel_id}", status_code=204)
def delete(
    hotel_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not HotelRepository(db).delete(hotel_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="Hotel not found")
