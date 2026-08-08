"""audit_log/schemas.py — Sprint-070: Pydantic schemas"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AuditLogBase(BaseModel):
    entity_type: str
    entity_id: Optional[str] = None
    action: str
    actor_id: Optional[str] = None
    actor_name: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    ip_address: Optional[str] = None
    hotel_id: Optional[str] = None
    metadata: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogResponse(AuditLogBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
