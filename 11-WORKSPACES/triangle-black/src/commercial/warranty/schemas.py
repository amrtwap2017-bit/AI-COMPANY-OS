"""warranty/schemas.py — Sprint-081"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WarrantyBase(BaseModel):
    asset_id: str
    asset_name: Optional[str] = None
    vendor_name: Optional[str] = None
    warranty_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    coverage_details: Optional[str] = None
    status: str = "active"

class WarrantyCreate(WarrantyBase):
    hotel_id: Optional[str] = None

class WarrantyResponse(WarrantyBase):
    id: str
    hotel_id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
