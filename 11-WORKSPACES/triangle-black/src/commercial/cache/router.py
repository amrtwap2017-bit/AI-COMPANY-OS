from __future__ import annotations
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from aioredis import Redis, create_redis_pool
from src.core.auth import get_current_user
from src.core.database import get_db
from src.commercial.cache.models import CacheConfig
from src.commercial.cache.schemas import CacheConfigCreate, CacheConfigUpdate, CacheConfigResponse
from src.commercial.cache.repository import CacheConfigRepository

router = APIRouter()

@router.post("/cache_configs", response_model=CacheConfigResponse)
def create_cache_config(
    cache_config: CacheConfigCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return CacheConfigRepository(db).create(cache_config.dict())

@router.get("/cache_configs", response_model=list[CacheConfigResponse])
def get_cache_configs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return CacheConfigRepository(db).list(skip, limit)

@router.get("/cache_configs/{obj_id}", response_model=CacheConfigResponse)
def get_cache_config(
    obj_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return CacheConfigRepository(db).get(obj_id)

@router.put("/cache_configs/{obj_id}", response_model=CacheConfigResponse)
def update_cache_config(
    obj_id: str,
    cache_config: CacheConfigUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return CacheConfigRepository(db).update(obj_id, cache_config.dict())

@router.delete("/cache_configs/{obj_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cache_config(
    obj_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    CacheConfigRepository(db).delete(obj_id)