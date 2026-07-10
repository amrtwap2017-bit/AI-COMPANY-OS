"""
Entity FastAPI router — Triangle Black
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_agent, require_manager
from src.core.tenant import get_hotel_id
from src.commercial.auth.models import User
from .schemas import EntityCreate, EntityUpdate, EntityResponse
from .repository import EntityRepository

router = APIRouter(prefix="/entitys", tags=["entitys"])


@router.post("/", response_model=EntityResponse, status_code=201)
def create(
    payload: EntityCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return EntityRepository(db).create(data)


@router.get("/", response_model=List[EntityResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return EntityRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)


@router.get("/{entity_id}", response_model=EntityResponse)
def get(
    entity_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = EntityRepository(db).get(entity_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Entity not found")
    return obj


@router.patch("/{entity_id}", response_model=EntityResponse)
def update(
    entity_id: str,
    payload: EntityUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = EntityRepository(db).update(
        entity_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Entity not found")
    return obj


@router.delete("/{entity_id}", status_code=204)
def delete(
    entity_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not EntityRepository(db).delete(entity_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="Entity not found")
