from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

"""
Asset FastAPI router — Triangle Black
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import AssetCreate, AssetUpdate, AssetResponse
from .repository import AssetRepository

router = APIRouter(prefix="/assets", tags=["assets"])

@router.post("/", response_model=AssetResponse, status_code=201)
def create(
    payload: AssetCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return AssetRepository(db).create(data)

@router.get("/", response_model=List[AssetResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return AssetRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)

@router.get("/{asset_id}", response_model=AssetResponse)
def get(
    asset_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = AssetRepository(db).get(asset_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Asset not found")
    return obj

@router.patch("/{asset_id}", response_model=AssetResponse)
def update(
    asset_id: str,
    payload: AssetUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = AssetRepository(db).update(
        asset_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Asset not found")
    return obj

@router.delete("/{asset_id}", status_code=204)
def delete(
    asset_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not AssetRepository(db).delete(asset_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="Asset not found")
