"""
LeadSearch FastAPI router
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from .schemas import LeadSearchCreate, LeadSearchUpdate, LeadSearchResponse
from .repository import LeadSearchRepository

router = APIRouter(prefix="/leadsearchs", tags=["leadsearchs"])


def get_db():
    raise NotImplementedError("Configure DB session in app factory")


@router.post("/", response_model=LeadSearchResponse, status_code=201)
def create(payload: LeadSearchCreate, db: Session = Depends(get_db)):
    return LeadSearchRepository(db).create(payload.model_dump())


@router.get("/", response_model=List[LeadSearchResponse])
def list_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return LeadSearchRepository(db).list(skip=skip, limit=limit)


@router.get("/{leadsearch_id}", response_model=LeadSearchResponse)
def get(leadsearch_id: str, db: Session = Depends(get_db)):
    obj = LeadSearchRepository(db).get(leadsearch_id)
    if not obj:
        raise HTTPException(status_code=404, detail="LeadSearch not found")
    return obj


@router.patch("/{leadsearch_id}", response_model=LeadSearchResponse)
def update(leadsearch_id: str, payload: LeadSearchUpdate, db: Session = Depends(get_db)):
    obj = LeadSearchRepository(db).update(leadsearch_id, payload.model_dump(exclude_none=True))
    if not obj:
        raise HTTPException(status_code=404, detail="LeadSearch not found")
    return obj


@router.delete("/{leadsearch_id}", status_code=204)
def delete(leadsearch_id: str, db: Session = Depends(get_db)):
    if not LeadSearchRepository(db).delete(leadsearch_id):
        raise HTTPException(status_code=404, detail="LeadSearch not found")
