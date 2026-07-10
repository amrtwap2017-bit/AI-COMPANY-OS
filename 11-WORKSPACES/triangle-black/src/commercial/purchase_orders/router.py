"""
PurchaseOrder FastAPI router — Triangle Black
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_agent, require_manager
from src.core.tenant import get_hotel_id
from src.commercial.auth.models import User
from .schemas import PurchaseOrderCreate, PurchaseOrderUpdate, PurchaseOrderResponse
from .repository import PurchaseOrderRepository

router = APIRouter(prefix="/inventory/purchase-orders", tags=["purchase-orders"])


@router.post("/", response_model=PurchaseOrderResponse, status_code=201)
def create(
    payload: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return PurchaseOrderRepository(db).create(data)


@router.get("/", response_model=List[PurchaseOrderResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return PurchaseOrderRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)


@router.get("/{po_id}", response_model=PurchaseOrderResponse)
def get(
    po_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = PurchaseOrderRepository(db).get(po_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="PurchaseOrder not found")
    return obj


@router.patch("/{po_id}", response_model=PurchaseOrderResponse)
def update(
    po_id: str,
    payload: PurchaseOrderUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = PurchaseOrderRepository(db).update(
        po_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="PurchaseOrder not found")
    return obj


@router.delete("/{po_id}", status_code=204)
def delete(
    po_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not PurchaseOrderRepository(db).delete(po_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="PurchaseOrder not found")
