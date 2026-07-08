"""
Pipeline FastAPI router — Triangle Black
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from .schemas import PipelineCreate, PipelineUpdate, PipelineResponse
from .repository import PipelineRepository

router = APIRouter(prefix="/pipelines", tags=["pipelines"])


@router.post("/", response_model=PipelineResponse, status_code=201)
def create(payload: PipelineCreate, db: Session = Depends(get_db)):
    return PipelineRepository(db).create(payload.model_dump())


@router.get("/", response_model=List[PipelineResponse])
def list_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return PipelineRepository(db).list(skip=skip, limit=limit)


@router.get("/{pipeline_id}", response_model=PipelineResponse)
def get(pipeline_id: str, db: Session = Depends(get_db)):
    obj = PipelineRepository(db).get(pipeline_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return obj


@router.patch("/{pipeline_id}", response_model=PipelineResponse)
def update(pipeline_id: str, payload: PipelineUpdate, db: Session = Depends(get_db)):
    obj = PipelineRepository(db).update(pipeline_id, payload.model_dump(exclude_none=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return obj


@router.delete("/{pipeline_id}", status_code=204)
def delete(pipeline_id: str, db: Session = Depends(get_db)):
    if not PipelineRepository(db).delete(pipeline_id):
        raise HTTPException(status_code=404, detail="Pipeline not found")
