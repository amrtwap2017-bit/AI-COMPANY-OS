from __future__ import annotations

"""
LeadSearch FastAPI router — Triangle Black
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import LeadSearchCreate, LeadSearchUpdate, LeadSearchResponse
from .repository import LeadSearchRepository

router = APIRouter(prefix="/searches", tags=["searches"])

@router.post("/", response_model=LeadSearchResponse, status_code=201)
def search_create(payload: LeadSearchCreate, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    return LeadSearchRepository(db).create(payload.model_dump())

@router.get("/", response_model=List[LeadSearchResponse])
def search_list_all(skip: int = 0, limit: int = 100, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    return LeadSearchRepository(db).list(skip=skip, limit=limit)

@router.get("/{leadsearch_id}", response_model=LeadSearchResponse)
def search_get(leadsearch_id: str, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    obj = LeadSearchRepository(db).get(leadsearch_id)
    if not obj:
        raise HTTPException(status_code=404, detail="LeadSearch not found")
    return obj

@router.patch("/{leadsearch_id}", response_model=LeadSearchResponse)
def search_update(leadsearch_id: str, payload: LeadSearchUpdate, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    obj = LeadSearchRepository(db).update(leadsearch_id, payload.model_dump(exclude_none=True))
    if not obj:
        raise HTTPException(status_code=404, detail="LeadSearch not found")
    return obj

@router.delete("/{leadsearch_id}", status_code=204)
def search_delete(leadsearch_id: str, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    if not LeadSearchRepository(db).delete(leadsearch_id):
        raise HTTPException(status_code=404, detail="LeadSearch not found")
