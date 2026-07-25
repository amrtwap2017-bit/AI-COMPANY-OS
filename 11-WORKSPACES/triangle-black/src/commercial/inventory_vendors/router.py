from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

"""
InventoryVendor FastAPI router — Triangle Black
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import InventoryVendorCreate, InventoryVendorUpdate, InventoryVendorResponse
from .repository import InventoryVendorRepository

router = APIRouter(prefix="/inventory-vendors", tags=["inventory-vendors"])

@router.post("/", response_model=InventoryVendorResponse, status_code=201)
def create(
    payload: InventoryVendorCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return InventoryVendorRepository(db).create(data)

@router.get("/", response_model=List[InventoryVendorResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return InventoryVendorRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)

@router.get("/{vendor_id}", response_model=InventoryVendorResponse)
def get(
    vendor_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = InventoryVendorRepository(db).get(vendor_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="InventoryVendor not found")
    return obj

@router.patch("/{vendor_id}", response_model=InventoryVendorResponse)
def update(
    vendor_id: str,
    payload: InventoryVendorUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = InventoryVendorRepository(db).update(
        vendor_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="InventoryVendor not found")
    return obj

@router.delete("/{vendor_id}", status_code=204)
def delete(
    vendor_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not InventoryVendorRepository(db).delete(vendor_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="InventoryVendor not found")
