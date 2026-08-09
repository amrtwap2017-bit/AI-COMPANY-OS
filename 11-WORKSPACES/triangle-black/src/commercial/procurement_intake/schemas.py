"""procurement_intake/schemas.py — Sprint-082"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IntakeLogEntry(BaseModel):
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    details: Optional[str] = None

class IntakeLogResponse(IntakeLogEntry):
    id: str
    hotel_id: str
    created_at: datetime
    class Config:
        from_attributes = True
