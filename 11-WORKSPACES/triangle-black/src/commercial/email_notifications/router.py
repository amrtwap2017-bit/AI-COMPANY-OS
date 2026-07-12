from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

"""
EmailNotification FastAPI router — Triangle Black
Handles email send requests and audit log queries.
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import (
    EmailNotificationCreate,
    EmailNotificationUpdate,
    EmailNotificationResponse,
)
from .repository import EmailNotificationRepository
from .service import send_email

router = APIRouter(prefix="/email-notifications", tags=["email-notifications"])

@router.post("/send", response_model=EmailNotificationResponse, status_code=201)
def send(
    payload: EmailNotificationCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """Send an email and log the result."""
    result = send_email(
        db=db,
        hotel_id=hotel_id,
        recipient=payload.recipient,
        subject=payload.subject,
        body=payload.body,
    )
    return result

@router.get("/", response_model=List[EmailNotificationResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    """List email notification audit log."""
    return EmailNotificationRepository(db).list(
        skip=skip, limit=limit, hotel_id=hotel_id, status=status
    )

@router.get("/{notification_id}", response_model=EmailNotificationResponse)
def get(
    notification_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = EmailNotificationRepository(db).get(notification_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="EmailNotification not found")
    return obj

@router.delete("/{notification_id}", status_code=204)
def delete(
    notification_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not EmailNotificationRepository(db).delete(notification_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="EmailNotification not found")
