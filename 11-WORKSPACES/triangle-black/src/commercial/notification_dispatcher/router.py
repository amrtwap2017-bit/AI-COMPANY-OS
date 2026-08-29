"""
V7-Sprint1 — Notification Dispatcher Router
Exposes notification inbox, dispatch, and badge count endpoints.
"""
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.notification_dispatcher.service import NotificationDispatcher

router = APIRouter(prefix="/notify", tags=["Notifications"])


def _svc(db: Session = Depends(get_db)) -> NotificationDispatcher:
    return NotificationDispatcher(db=db)


@router.get("/inbox")
def get_notification_inbox(
    limit: int = Query(default=20, ge=1, le=100),
    unread_only: bool = Query(default=False),
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    svc: NotificationDispatcher = Depends(_svc),
):
    """In-app notification inbox for current hotel."""
    return svc.get_inbox(hotel_id, limit=limit, unread_only=unread_only)


@router.get("/unread-count")
def get_unread_count(
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    svc: NotificationDispatcher = Depends(_svc),
):
    """Badge count for notification bell."""
    return svc.get_unread_count(hotel_id)


@router.post("/dispatch")
def dispatch_notifications(
    payload: dict = Body(default={}),
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    svc: NotificationDispatcher = Depends(_svc),
):
    """
    Dispatch pending critical/high notifications to email.
    Requires: to_email in payload (or uses user email).
    If SMTP not configured: logs only, returns smtp_enabled=false.
    """
    to_email = payload.get("to_email", "") or \
               getattr(current_user, "email", "")
    if not to_email:
        return {"error": "to_email required", "dispatched": 0}
    priorities = payload.get("priorities", ["critical", "high"])
    return svc.dispatch_pending(
        hotel_id=hotel_id,
        to_email=to_email,
        priorities=priorities,
    )


@router.post("/create")
def create_notification(
    payload: dict = Body(...),
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    svc: NotificationDispatcher = Depends(_svc),
):
    """Create a notification record (for testing and internal use)."""
    nid = svc.create_notification(
        hotel_id=hotel_id,
        title=payload.get("title", "System Notification"),
        message=payload.get("message", ""),
        ntype=payload.get("type", "info"),
        priority=payload.get("priority", "medium"),
        entity_type=payload.get("entity_type", ""),
        entity_id=payload.get("entity_id", ""),
    )
    return {"id": nid, "hotel_id": hotel_id, "created": True}
