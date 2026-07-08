"""
Triangle Black — Hotel Management API
Admin-only: create/manage hotel tenants.
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_admin, require_manager
from src.commercial.auth.models import User
from .schemas import HotelCreate, HotelUpdate, HotelResponse
from .repository import HotelRepository

router = APIRouter(prefix="/hotels", tags=["hotels"])


@router.post("/", response_model=HotelResponse, status_code=201)
def create_hotel(
    payload: HotelCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    repo = HotelRepository(db)
    if repo.get_by_slug(payload.slug):
        raise HTTPException(status_code=400,
                            detail=f"Hotel slug '{payload.slug}' already exists")
    return repo.create(payload.model_dump())


@router.get("/", response_model=List[HotelResponse])
def list_hotels(
    active_only: bool = False,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    return HotelRepository(db).list(active_only=active_only)


@router.get("/{hotel_id}", response_model=HotelResponse)
def get_hotel(
    hotel_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    hotel = HotelRepository(db).get(hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel


@router.patch("/{hotel_id}", response_model=HotelResponse)
def update_hotel(
    hotel_id: str,
    payload: HotelUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    hotel = HotelRepository(db).update(
        hotel_id, payload.model_dump(exclude_none=True)
    )
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel


@router.delete("/{hotel_id}", status_code=204)
def deactivate_hotel(
    hotel_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if not HotelRepository(db).deactivate(hotel_id):
        raise HTTPException(status_code=404, detail="Hotel not found")
