"""
EmailNotification Pydantic schemas — Triangle Black
"""
from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


class EmailNotificationCreate(BaseModel):
    recipient: str
    subject: str
    body: str


class EmailNotificationUpdate(BaseModel):
    status: Optional[str] = None
    error_msg: Optional[str] = None
    sent_at: Optional[datetime] = None


class EmailNotificationResponse(BaseModel):
    id: str
    hotel_id: str
    recipient: str
    subject: str
    body: str
    status: str
    sent_at: Optional[datetime]
    error_msg: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
