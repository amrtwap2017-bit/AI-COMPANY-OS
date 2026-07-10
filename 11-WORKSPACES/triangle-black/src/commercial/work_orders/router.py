"""
WorkOrder FastAPI router — Triangle Black
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_agent, require_manager
from src.core.tenant import get_hotel_id
from src.commercial.auth.models import User
from .schemas import WorkOrderCreate, WorkOrderUpdate, WorkOrderResponse
from .repository import WorkOrderRepository

router = APIRouter(prefix="/work-orders", tags=["work-orders"])


@router.post("/", response_model=WorkOrderResponse, status_code=201)
def create(
    payload: WorkOrderCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return WorkOrderRepository(db).create(data)


@router.get("/", response_model=List[WorkOrderResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return WorkOrderRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)


@router.get("/{work_order_id}", response_model=WorkOrderResponse)
def get(
    work_order_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = WorkOrderRepository(db).get(work_order_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="WorkOrder not found")
    return obj


@router.patch("/{work_order_id}", response_model=WorkOrderResponse)
def update(
    work_order_id: str,
    payload: WorkOrderUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = WorkOrderRepository(db).update(
        work_order_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="WorkOrder not found")
    return obj


@router.delete("/{work_order_id}", status_code=204)
def delete(
    work_order_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not WorkOrderRepository(db).delete(work_order_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="WorkOrder not found")
