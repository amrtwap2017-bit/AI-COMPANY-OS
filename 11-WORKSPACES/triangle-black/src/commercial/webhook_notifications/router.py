"""
WebhookConfig FastAPI router
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from .schemas import WebhookConfigCreate, WebhookConfigUpdate, WebhookConfigResponse
from .repository import WebhookConfigRepository

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def get_db():
    raise NotImplementedError("Configure DB session in app factory")


@router.post("/", response_model=WebhookConfigResponse, status_code=201)
def create(payload: WebhookConfigCreate, db: Session = Depends(get_db)):
    return WebhookConfigRepository(db).create(payload.model_dump())


@router.get("/", response_model=List[WebhookConfigResponse])
def list_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return WebhookConfigRepository(db).list(skip=skip, limit=limit)


@router.get("/{webhook_id}", response_model=WebhookConfigResponse)
def get(webhook_id: str, db: Session = Depends(get_db)):
    obj = WebhookConfigRepository(db).get(webhook_id)
    if not obj:
        raise HTTPException(status_code=404, detail="WebhookConfig not found")
    return obj


@router.patch("/{webhook_id}", response_model=WebhookConfigResponse)
def update(webhook_id: str, payload: WebhookConfigUpdate, db: Session = Depends(get_db)):
    obj = WebhookConfigRepository(db).update(webhook_id, payload.model_dump(exclude_none=True))
    if not obj:
        raise HTTPException(status_code=404, detail="WebhookConfig not found")
    return obj


@router.delete("/{webhook_id}", status_code=204)
def delete(webhook_id: str, db: Session = Depends(get_db)):
    if not WebhookConfigRepository(db).delete(webhook_id):
        raise HTTPException(status_code=404, detail="WebhookConfig not found")
