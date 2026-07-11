from sqlalchemy.orm import Session
from src.core.database import get_db
from .models import Notification

class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_notification(self, notification_data: dict):
        notification = Notification(**notification_data)
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def get_unread_notifications(self, hotel_id: str):
        return self.db.query(Notification).filter(Notification.hotel_id == hotel_id, Notification.read == False).all()

    def mark_notification_read(self, notification_id: str):
        notification = self.db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            notification.read = True
            self.db.commit()
            return notification
        return None

    def mark_all_notifications_read(self, hotel_id: str):
        notifications = self.db.query(Notification).filter(Notification.hotel_id == hotel_id, Notification.read == False).all()
        for notification in notifications:
            notification.read = True
        self.db.commit()