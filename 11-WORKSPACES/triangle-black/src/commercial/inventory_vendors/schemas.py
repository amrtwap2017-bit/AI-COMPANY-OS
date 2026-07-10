from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class InventoryVendorCreate(BaseModel):
    vendor_code: str
    name: str
    name_ar: Optional[str] = None
    category: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    tax_number: Optional[str] = None
    payment_terms: str = "net30"
    lead_time_days: int = 7
    rating: int = 5
    is_active: bool = True
    notes: Optional[str] = None

class InventoryVendorUpdate(BaseModel):
    name: Optional[str] = None
    name_ar: Optional[str] = None
    category: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    tax_number: Optional[str] = None
    payment_terms: Optional[str] = None
    lead_time_days: Optional[int] = None
    rating: Optional[int] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class InventoryVendorResponse(BaseModel):
    id: str
    hotel_id: str
    vendor_code: str
    name: str
    name_ar: Optional[str]
    category: Optional[str]
    contact_person: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    tax_number: Optional[str]
    payment_terms: Optional[str]
    lead_time_days: Optional[int]
    rating: Optional[int]
    is_active: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
