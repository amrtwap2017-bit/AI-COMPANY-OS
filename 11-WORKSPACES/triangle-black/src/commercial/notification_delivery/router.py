"""
Notification Delivery Router — Triangle Black A-068
In-app notification inbox for users.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.notification_delivery.service import NotificationDeliveryService

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/", summary="Get Notification Inbox")
def get_inbox(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    limit: int = Query(default=20, le=50),
    unread_only: bool = Query(default=False),
):
    svc = NotificationDeliveryService(db=db, hotel_id=hotel_id)
    notifications = svc.get_inbox(limit=limit, unread_only=unread_only)
    return {
        "hotel_id": hotel_id,
        "count": len(notifications),
        "unread_only": unread_only,
        "notifications": notifications,
    }

@router.get("/unread-count", summary="Unread Notification Badge Count")
def get_unread_count(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = NotificationDeliveryService(db=db, hotel_id=hotel_id)
    return svc.get_unread_count()

@router.post("/{notification_id}/read", summary="Mark Notification as Read")
def mark_read(
    notification_id: str,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = NotificationDeliveryService(db=db, hotel_id=hotel_id)
    success = svc.mark_read(notification_id)
    return {"success": success, "notification_id": notification_id}

@router.post("/mark-all-read", summary="Mark All Notifications as Read")
def mark_all_read(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = NotificationDeliveryService(db=db, hotel_id=hotel_id)
    count = svc.mark_all_read()
    return {"success": True, "marked_read": count}
