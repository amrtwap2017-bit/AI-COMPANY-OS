from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

"""
Warehouse FastAPI router — Triangle Black
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import WarehouseCreate, WarehouseUpdate, WarehouseResponse
from .repository import WarehouseRepository

router = APIRouter(prefix="/warehouses", tags=["warehouses"])

@router.post("/", response_model=WarehouseResponse, status_code=201)
def create(
    payload: WarehouseCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return WarehouseRepository(db).create(data)

@router.get("/", response_model=List[WarehouseResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return WarehouseRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)

@router.get("/{warehouse_id}", response_model=WarehouseResponse)
def get(
    warehouse_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = WarehouseRepository(db).get(warehouse_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return obj

@router.patch("/{warehouse_id}", response_model=WarehouseResponse)
def update(
    warehouse_id: str,
    payload: WarehouseUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = WarehouseRepository(db).update(
        warehouse_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return obj

@router.delete("/{warehouse_id}", status_code=204)
def delete(
    warehouse_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not WarehouseRepository(db).delete(warehouse_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="Warehouse not found")
