from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

"""
ServiceRequest FastAPI router — Triangle Black
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import ServiceRequestCreate, ServiceRequestUpdate, ServiceRequestResponse
from .repository import ServiceRequestRepository

router = APIRouter(prefix="/service-requests", tags=["service-requests"])

@router.post("/", response_model=ServiceRequestResponse, status_code=201)
def create(
    payload: ServiceRequestCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return ServiceRequestRepository(db).create(data)

@router.get("/", response_model=List[ServiceRequestResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return ServiceRequestRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)

@router.get("/{request_id}", response_model=ServiceRequestResponse)
def get(
    request_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = ServiceRequestRepository(db).get(request_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="ServiceRequest not found")
    return obj

@router.patch("/{request_id}", response_model=ServiceRequestResponse)
def update(
    request_id: str,
    payload: ServiceRequestUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = ServiceRequestRepository(db).update(
        request_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="ServiceRequest not found")
    return obj

@router.delete("/{request_id}", status_code=204)
def delete(
    request_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not ServiceRequestRepository(db).delete(request_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="ServiceRequest not found")
