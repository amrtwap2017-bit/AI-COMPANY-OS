from __future__ import annotations
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.auth import get_current_user
from src.core.database import get_db
from .models import Pipeline
from .repository import PipelineRepository
from .schemas import PipelineCreate, PipelineUpdate, PipelineResponse


router = APIRouter()

@router.post("/pipeline", response_model=PipelineResponse)
def create_pipeline(
    pipeline: PipelineCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    return PipelineRepository(db).create(pipeline.dict())

@router.get("/pipeline/{pipeline_id}", response_model=PipelineResponse)
def get_pipeline(
    pipeline_id: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    pipeline = PipelineRepository(db).get(pipeline_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline

@router.get("/pipeline", response_model=List[PipelineResponse])
def list_pipelines(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    return PipelineRepository(db).list(skip, limit)

@router.put("/pipeline/{pipeline_id}", response_model=PipelineResponse)
def update_pipeline(
    pipeline_id: str,
    pipeline_update: PipelineUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    pipeline = PipelineRepository(db).update(pipeline_id, pipeline_update.dict())
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline

@router.delete("/pipeline/{pipeline_id}", response_model=bool)
def delete_pipeline(
    pipeline_id: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    return PipelineRepository(db).delete(pipeline_id)