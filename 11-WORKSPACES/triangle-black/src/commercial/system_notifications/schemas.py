from datetime import datetime
from datetime import datetime
from pydantic import BaseModel

class NotificationCreate(BaseModel):
    hotel_id: str
    type: str
    title: str
    body: str

class NotificationUpdate(BaseModel):
    read: bool

class NotificationResponse(NotificationCreate):
    id: str
    created_at: datetime
