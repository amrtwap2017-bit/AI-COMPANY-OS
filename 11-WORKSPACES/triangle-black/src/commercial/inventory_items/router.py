"""
InventoryItem FastAPI router — Triangle Black
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_agent, require_manager
from src.core.tenant import get_hotel_id
from src.commercial.auth.models import User
from .schemas import InventoryItemCreate, InventoryItemUpdate, InventoryItemResponse
from .repository import InventoryItemRepository

router = APIRouter(prefix="/inventory/items", tags=["inventory-items"])


@router.post("/", response_model=InventoryItemResponse, status_code=201)
def create(
    payload: InventoryItemCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return InventoryItemRepository(db).create(data)


@router.get("/", response_model=List[InventoryItemResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return InventoryItemRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)


@router.get("/{item_id}", response_model=InventoryItemResponse)
def get(
    item_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = InventoryItemRepository(db).get(item_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="InventoryItem not found")
    return obj


@router.patch("/{item_id}", response_model=InventoryItemResponse)
def update(
    item_id: str,
    payload: InventoryItemUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = InventoryItemRepository(db).update(
        item_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="InventoryItem not found")
    return obj


@router.delete("/{item_id}", status_code=204)
def delete(
    item_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not InventoryItemRepository(db).delete(item_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="InventoryItem not found")
