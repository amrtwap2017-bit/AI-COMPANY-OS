"""
StockMovement FastAPI router — Triangle Black
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_agent, require_manager
from src.core.tenant import get_hotel_id
from src.commercial.auth.models import User
from .schemas import StockMovementCreate, StockMovementResponse
from .repository import StockMovementRepository

router = APIRouter(prefix="/inventory/movements", tags=["stock-movements"])


@router.post("/", response_model=StockMovementResponse, status_code=201)
def create(
    payload: StockMovementCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return StockMovementRepository(db).create(data)


@router.get("/", response_model=List[StockMovementResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return StockMovementRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)


@router.get("/{movement_id}", response_model=StockMovementResponse)
def get(
    movement_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = StockMovementRepository(db).get(movement_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="StockMovement not found")
    return obj


@router.delete("/{movement_id}", status_code=204)
def delete(
    movement_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not StockMovementRepository(db).delete(movement_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="StockMovement not found")
