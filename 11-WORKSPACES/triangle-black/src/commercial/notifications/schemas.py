from __future__ import annotations
from datetime import datetime


from datetime import datetime
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id:             str
    title:          str
    message:        str
    type:           str
    entity_id:      Optional[str] = None
    entity_type:    Optional[str] = None
    recipient_role: str
    is_read:        bool
    created_at:     datetime
    updated_at:     datetime

    model_config = {"from_attributes": True}


class NotificationList(BaseModel):
    notifications: list[NotificationResponse]
    unread_count:  int
