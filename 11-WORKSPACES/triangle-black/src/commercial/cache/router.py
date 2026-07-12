from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

"""
CacheConfig FastAPI router — Triangle Black
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import CacheConfigCreate, CacheConfigUpdate, CacheConfigResponse
from .repository import CacheConfigRepository

router = APIRouter(prefix="/cacheconfigs", tags=["cacheconfigs"])

@router.post("/", response_model=CacheConfigResponse, status_code=201)
def create(
    payload: CacheConfigCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
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
    return CacheConfigRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)

@router.get("/{cacheconfig_id}", response_model=CacheConfigResponse)
def get(
    cacheconfig_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = CacheConfigRepository(db).get(cacheconfig_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="CacheConfig not found")
    return obj

@router.patch("/{cacheconfig_id}", response_model=CacheConfigResponse)
def update(
    cacheconfig_id: str,
    payload: CacheConfigUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = CacheConfigRepository(db).update(
        cacheconfig_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="CacheConfig not found")
    return obj

@router.delete("/{cacheconfig_id}", status_code=204)
def delete(
    cacheconfig_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not CacheConfigRepository(db).delete(cacheconfig_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="CacheConfig not found")
