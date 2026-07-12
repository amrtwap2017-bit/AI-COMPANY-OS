from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

"""
Technician FastAPI router — Triangle Black
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import TechnicianCreate, TechnicianUpdate, TechnicianResponse
from .repository import TechnicianRepository

router = APIRouter(prefix="/technicians", tags=["technicians"])

@router.post("/", response_model=TechnicianResponse, status_code=201)
def create(
    payload: TechnicianCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return TechnicianRepository(db).create(data)

@router.get("/", response_model=List[TechnicianResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return TechnicianRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)

@router.get("/{technician_id}", response_model=TechnicianResponse)
def get(
    technician_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = TechnicianRepository(db).get(technician_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Technician not found")
    return obj

@router.patch("/{technician_id}", response_model=TechnicianResponse)
def update(
    technician_id: str,
    payload: TechnicianUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = TechnicianRepository(db).update(
        technician_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Technician not found")
    return obj

@router.delete("/{technician_id}", status_code=204)
def delete(
    technician_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not TechnicianRepository(db).delete(technician_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="Technician not found")
