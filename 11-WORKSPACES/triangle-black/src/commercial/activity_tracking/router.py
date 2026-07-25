from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

"""
Activity FastAPI router — Triangle Black
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import ActivityCreate, ActivityUpdate, ActivityResponse
from .repository import ActivityRepository

router = APIRouter(prefix="/activities", tags=["activities"])

@router.post("/", response_model=ActivityResponse, status_code=201)
def create(
    payload: ActivityCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return ActivityRepository(db).create(data)

@router.get("/", response_model=List[ActivityResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return ActivityRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)

@router.get("/{activity_id}", response_model=ActivityResponse)
def get(
    activity_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = ActivityRepository(db).get(activity_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Activity not found")
    return obj

@router.patch("/{activity_id}", response_model=ActivityResponse)
def update(
    activity_id: str,
    payload: ActivityUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = ActivityRepository(db).update(
        activity_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Activity not found")
    return obj

@router.delete("/{activity_id}", status_code=204)
def delete(
    activity_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not ActivityRepository(db).delete(activity_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="Activity not found")
