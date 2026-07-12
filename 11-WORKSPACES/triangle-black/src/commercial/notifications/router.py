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

@router.get("/", response_model=NotificationList)
def list_notifications(
    unread_only: bool = False,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = NotificationRepository(db)
    items = repo.list_for_role(
        role=current_user.role,
        unread_only=unread_only,
        limit=limit,
    )
    unread = repo.unread_count(current_user.role)
    return NotificationList(
        notifications=[NotificationResponse.model_validate(n) for n in items],
        unread_count=unread,
    )

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
