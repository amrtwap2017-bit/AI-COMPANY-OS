from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .repository import NotificationRepository
from .schemas import NotificationCreate, NotificationUpdate, NotificationResponse

router = APIRouter()

@router.post("/notifications/")
def create_notification(notification_data: NotificationCreate, db: Session = Depends(get_db), hotel_id: str = Depends(get_hotel_id)):
    notification_repo = NotificationRepository(db)
    return notification_repo.create_notification({**notification_data.dict(), "hotel_id": hotel_id})

@router.get("/notifications/")
def get_unread_notifications(hotel_id: str, db: Session = Depends(get_db), _: User = Depends(require_agent)):
    notification_repo = NotificationRepository(db)
    return [NotificationResponse(**notification.__dict__) for notification in notification_repo.get_unread_notifications(hotel_id)]

@router.patch("/notifications/{id}/read")
def mark_notification_read(notification_id: str, db: Session = Depends(get_db), _: User = Depends(require_agent)):
    notification_repo = NotificationRepository(db)
    notification = notification_repo.mark_notification_read(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return NotificationResponse(**notification.__dict__)

@router.post("/notifications/bulk-read")
def mark_all_notifications_read(hotel_id: str, db: Session = Depends(get_db), _: User = Depends(require_agent)):
    notification_repo = NotificationRepository(db)
    notification_repo.mark_all_notifications_read(hotel_id)
    return {"message": "All notifications marked as read"}