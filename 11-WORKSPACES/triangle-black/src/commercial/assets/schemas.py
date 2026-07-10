from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class AssetCreate(BaseModel):
    site_id: str
    category: str
    name: str
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    location_description: Optional[str] = None
    service_frequency: str = "monthly"
    installation_date: Optional[datetime] = None
    warranty_expiry: Optional[datetime] = None
    criticality: str = "medium"
    status: str = "operational"
    notes: Optional[str] = None

class AssetUpdate(BaseModel):
    category: Optional[str] = None
    name: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    location_description: Optional[str] = None
    service_frequency: Optional[str] = None
    installation_date: Optional[datetime] = None
    warranty_expiry: Optional[datetime] = None
    criticality: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class AssetResponse(BaseModel):
    id: str
    hotel_id: str
    site_id: str
    category: str
    name: str
    manufacturer: Optional[str]
    model: Optional[str]
    serial_number: Optional[str]
    location_description: Optional[str]
    service_frequency: Optional[str]
    installation_date: Optional[datetime]
    warranty_expiry: Optional[datetime]
    criticality: str
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
