from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

"""
PurchaseOrder FastAPI router — Triangle Black
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import PurchaseOrderCreate, PurchaseOrderUpdate, PurchaseOrderResponse
from .repository import PurchaseOrderRepository
from src.core.audit import audit_create, audit_update

router = APIRouter(prefix="/purchase-orders", tags=["purchase-orders"])

@router.post("/", response_model=PurchaseOrderResponse, status_code=201)
def create(
    payload: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    result = PurchaseOrderRepository(db).create(data)
    try:
        audit_create(db, "purchase_order",
                     result.id if hasattr(result, "id") else str(result),
                     hotel_id=hotel_id,
                     metadata={"vendor_id": data.get("vendor_id"),
                               "total_amount": data.get("total_amount")})
    except Exception:
        pass
    return result

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
    try:
        audit_update(db, "purchase_order", po_id, hotel_id=hotel_id,
                     new_value=payload.model_dump(exclude_none=True))
    except Exception:
        pass
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
