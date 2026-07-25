from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

"""
GoodsReceipt FastAPI router — Triangle Black
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import GoodsReceiptCreate, GoodsReceiptUpdate, GoodsReceiptResponse
from .repository import GoodsReceiptRepository

router = APIRouter(prefix="/goods-receipts", tags=["goods-receipts"])

@router.post("/", response_model=GoodsReceiptResponse, status_code=201)
def create(
    payload: GoodsReceiptCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return GoodsReceiptRepository(db).create(data)

@router.get("/", response_model=List[GoodsReceiptResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return GoodsReceiptRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)

@router.get("/{grn_id}", response_model=GoodsReceiptResponse)
def get(
    grn_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = GoodsReceiptRepository(db).get(grn_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="GoodsReceipt not found")
    return obj

@router.patch("/{grn_id}", response_model=GoodsReceiptResponse)
def update(
    grn_id: str,
    payload: GoodsReceiptUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = GoodsReceiptRepository(db).update(
        grn_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="GoodsReceipt not found")
    return obj

@router.delete("/{grn_id}", status_code=204)
def delete(
    grn_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not GoodsReceiptRepository(db).delete(grn_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="GoodsReceipt not found")
