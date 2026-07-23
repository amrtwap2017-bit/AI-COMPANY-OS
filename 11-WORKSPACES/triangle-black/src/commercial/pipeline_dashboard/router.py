from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

"""
Pipeline FastAPI router — Triangle Black
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import PipelineCreate, PipelineUpdate, PipelineResponse
from .repository import PipelineRepository

router = APIRouter(prefix="/pipelines", tags=["pipelines"])

@router.post("/", response_model=PipelineResponse, status_code=201)
def pipeline_create(
    payload: PipelineCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return PipelineRepository(db).create(data)

@router.get("/", response_model=List[PipelineResponse])
def pipeline_list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return PipelineRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)

@router.get("/{pipeline_id}", response_model=PipelineResponse)
def pipeline_get(
    pipeline_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = PipelineRepository(db).get(pipeline_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return obj

@router.patch("/{pipeline_id}", response_model=PipelineResponse)
def pipeline_update(
    pipeline_id: str,
    payload: PipelineUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = PipelineRepository(db).update(
        pipeline_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return obj

@router.delete("/{pipeline_id}", status_code=204)
def pipeline_delete(
    pipeline_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not PipelineRepository(db).delete(pipeline_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="Pipeline not found")
