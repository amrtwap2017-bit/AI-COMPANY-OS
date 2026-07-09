"""
CacheConfig FastAPI router — Triangle Black
Manages per-hotel cache configuration (TTL, enabled flags).
No external Redis dependency — configuration stored in PostgreSQL.
"""
from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_agent, require_manager
from src.core.tenant import get_hotel_id
from src.commercial.auth.models import User
from .schemas import CacheConfigCreate, CacheConfigUpdate, CacheConfigResponse
from .repository import CacheConfigRepository

router = APIRouter(prefix="/cache-configs", tags=["cache-configs"])


@router.post("/", response_model=CacheConfigResponse, status_code=201)
def create(
    payload: CacheConfigCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    """Create a new cache configuration entry."""
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return CacheConfigRepository(db).create(data)


@router.get("/", response_model=List[CacheConfigResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """List all cache configurations for this hotel."""
    return CacheConfigRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)


@router.get("/{config_id}", response_model=CacheConfigResponse)
def get(
    config_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = CacheConfigRepository(db).get(config_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="CacheConfig not found")
    return obj


@router.patch("/{config_id}", response_model=CacheConfigResponse)
def update(
    config_id: str,
    payload: CacheConfigUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = CacheConfigRepository(db).update(
        config_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="CacheConfig not found")
    return obj


@router.delete("/{config_id}", status_code=204)
def delete(
    config_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not CacheConfigRepository(db).delete(config_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="CacheConfig not found")
