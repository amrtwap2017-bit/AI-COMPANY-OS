"""
Lead FastAPI router
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from .schemas import LeadCreate, LeadUpdate, LeadResponse
from .repository import LeadRepository

router = APIRouter(prefix="/leads", tags=["leads"])


def get_db():
    """Dependency — override in app startup."""
    raise NotImplementedError("Configure DB session in app factory")


@router.post("/", response_model=LeadResponse, status_code=201)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    repo = LeadRepository(db)
    return repo.create(payload.model_dump())


@router.get("/", response_model=List[LeadResponse])
def list_leads(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = LeadRepository(db)
    return repo.list(skip=skip, limit=limit)


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: str, db: Session = Depends(get_db)):
    repo = LeadRepository(db)
    obj = repo.get(lead_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Lead not found")
    return obj


@router.patch("/{lead_id}", response_model=LeadResponse)
def update_lead(lead_id: str, payload: LeadUpdate, db: Session = Depends(get_db)):
    repo = LeadRepository(db)
    obj = repo.update(lead_id, payload.model_dump(exclude_none=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Lead not found")
    return obj


@router.delete("/{lead_id}", status_code=204)
def delete_lead(lead_id: str, db: Session = Depends(get_db)):
    repo = LeadRepository(db)
    if not repo.delete(lead_id):
        raise HTTPException(status_code=404, detail="Lead not found")
