from __future__ import annotations

from src.commercial.auth.models import User

"""
Notifications router — Triangle Black
GET    /notifications/           → list for current user role
GET    /notifications/unread     → unread count only
PATCH  /notifications/{id}/read  → mark one as read
POST   /notifications/read-all   → mark all as read for role
DELETE /notifications/{id}       → delete one
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.core.auth import get_current_user
from .repository import NotificationRepository
from .schemas import NotificationResponse, NotificationList

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/")
def list_notifications(
    unread_only: bool = False,
    limit: int = 500,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = NotificationRepository(db)
    items = repo.list_for_role(
        role=current_user.role,
        unread_only=unread_only,
        limit=limit,
    )
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "entity_id": n.entity_id,
            "entity_type": n.entity_type,
            "recipient_role": n.recipient_role,
            "is_read": n.is_read,
            "hotel_id": n.hotel_id,
            "created_at": str(n.created_at),
            "updated_at": str(n.updated_at),
        }
        for n in items
    ]

@router.get("/unread", response_model=dict)
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = NotificationRepository(db)
    count = repo.unread_count(current_user.role)
    return {"unread_count": count, "role": current_user.role}

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = NotificationRepository(db)
    obj = repo.mark_read(notification_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Notification not found")
    return NotificationResponse.model_validate(obj)

@router.post("/read-all", response_model=dict)
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = NotificationRepository(db)
    count = repo.mark_all_read(current_user.role)
    return {"ok": True, "marked_read": count}

@router.delete("/{notification_id}", response_model=dict)
def delete_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = NotificationRepository(db)
    ok = repo.delete(notification_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"ok": True, "deleted": notification_id}