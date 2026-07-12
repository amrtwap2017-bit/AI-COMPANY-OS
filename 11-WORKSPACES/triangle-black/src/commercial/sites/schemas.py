from __future__ import annotations
from datetime import datetime


from datetime import datetime
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class SiteCreate(BaseModel):
    name: str
    contract_id: Optional[str] = None
    lead_id: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True

class SiteUpdate(BaseModel):
    name: Optional[str] = None
    contract_id: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class SiteResponse(BaseModel):
    id: str
    hotel_id: str
    contract_id: Optional[str]
    lead_id: Optional[str]
    name: str
    address: Optional[str]
    city: Optional[str]
    contact_person: Optional[str]
    contact_phone: Optional[str]
    notes: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
