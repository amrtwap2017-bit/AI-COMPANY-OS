"""notification_engine/schemas.py — Sprint-070"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationBase(BaseModel):
    type: str
    title: str
    message: Optional[str] = None
    priority: str = "medium"
    hotel_id: Optional[str] = None
    user_id: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    action_url: Optional[str] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationResponse(NotificationBase):
    id: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
