from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

"""
WebhookConfig FastAPI router — Triangle Black
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import WebhookConfigCreate, WebhookConfigUpdate, WebhookConfigResponse
from .repository import WebhookConfigRepository

router = APIRouter(prefix="/webhookconfigs", tags=["webhookconfigs"])

@router.post("/", response_model=WebhookConfigResponse, status_code=201)
def create(
    payload: WebhookConfigCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return WebhookConfigRepository(db).create(data)

@router.get("/", response_model=List[WebhookConfigResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return WebhookConfigRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)

@router.get("/{webhookconfig_id}", response_model=WebhookConfigResponse)
def get(
    webhookconfig_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = WebhookConfigRepository(db).get(webhookconfig_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="WebhookConfig not found")
    return obj

@router.patch("/{webhookconfig_id}", response_model=WebhookConfigResponse)
def update(
    webhookconfig_id: str,
    payload: WebhookConfigUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = WebhookConfigRepository(db).update(
        webhookconfig_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="WebhookConfig not found")
    return obj

@router.delete("/{webhookconfig_id}", status_code=204)
def delete(
    webhookconfig_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not WebhookConfigRepository(db).delete(webhookconfig_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="WebhookConfig not found")
