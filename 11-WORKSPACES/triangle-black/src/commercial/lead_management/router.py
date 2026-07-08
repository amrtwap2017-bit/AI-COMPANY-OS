"""
Triangle Black — Leads Router
All queries filtered by hotel_id for complete tenant isolation.
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_agent, require_manager, get_current_user
from src.core.tenant import get_hotel_id
from src.commercial.auth.models import User
from .schemas import LeadCreate, LeadUpdate, LeadResponse
from .repository import LeadRepository

router = APIRouter(prefix="/leads", tags=["leads"])


@router.post("/", response_model=LeadResponse, status_code=201)
def create(
    payload: LeadCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return LeadRepository(db).create(data)


@router.get("/", response_model=List[LeadResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return LeadRepository(db).list(
        skip=skip, limit=limit, hotel_id=hotel_id
    )


@router.get("/{lead_id}", response_model=LeadResponse)
def get(
    lead_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = LeadRepository(db).get(lead_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Lead not found")
    return obj


@router.patch("/{lead_id}", response_model=LeadResponse)
def update(
    lead_id: str,
    payload: LeadUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = LeadRepository(db).update(
        lead_id,
        payload.model_dump(exclude_none=True),
        hotel_id=hotel_id,
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Lead not found")
    return obj


@router.delete("/{lead_id}", status_code=204)
def delete(
    lead_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not LeadRepository(db).delete(lead_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="Lead not found")
