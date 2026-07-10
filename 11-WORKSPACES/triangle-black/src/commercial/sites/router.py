"""
Site FastAPI router — Triangle Black
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_agent, require_manager
from src.core.tenant import get_hotel_id
from src.commercial.auth.models import User
from .schemas import SiteCreate, SiteUpdate, SiteResponse
from .repository import SiteRepository

router = APIRouter(prefix="/sites", tags=["sites"])


@router.post("/", response_model=SiteResponse, status_code=201)
def create(
    payload: SiteCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return SiteRepository(db).create(data)


@router.get("/", response_model=List[SiteResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return SiteRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)


@router.get("/{site_id}", response_model=SiteResponse)
def get(
    site_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = SiteRepository(db).get(site_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Site not found")
    return obj


@router.patch("/{site_id}", response_model=SiteResponse)
def update(
    site_id: str,
    payload: SiteUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = SiteRepository(db).update(
        site_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Site not found")
    return obj


@router.delete("/{site_id}", status_code=204)
def delete(
    site_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not SiteRepository(db).delete(site_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="Site not found")
