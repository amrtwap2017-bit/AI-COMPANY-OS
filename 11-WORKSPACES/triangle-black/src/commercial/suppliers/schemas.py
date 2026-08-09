"""suppliers/schemas.py — Sprint-081"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SupplierBase(BaseModel):
    company_name: str
    arabic_name: Optional[str] = None
    status: str = "active"
    supplier_type: Optional[str] = None
    payment_terms: Optional[str] = "net_30"
    lead_time_days: Optional[int] = 7
    risk_level: Optional[str] = "low"
    city: Optional[str] = None
    country: Optional[str] = "Egypt"
    phone: Optional[str] = None
    email: Optional[str] = None
    category: Optional[str] = None
    rating: Optional[float] = 0

class SupplierCreate(SupplierBase):
    hotel_id: Optional[str] = None
    supplier_code: Optional[str] = None

class SupplierUpdate(BaseModel):
    company_name: Optional[str] = None
    status: Optional[str] = None
    risk_level: Optional[str] = None
    rating: Optional[float] = None

class SupplierResponse(SupplierBase):
    id: str
    hotel_id: str
    supplier_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
