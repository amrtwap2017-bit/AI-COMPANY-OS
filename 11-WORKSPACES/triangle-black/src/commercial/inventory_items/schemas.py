from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class InventoryItemCreate(BaseModel):
    item_code: str
    name: str
    name_ar: Optional[str] = None
    category: str = "general"
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    unit_of_measure: str = "piece"
    item_type: str = "spare_part"
    is_stockable: bool = True
    preferred_vendor_id: Optional[str] = None
    min_stock: float = 0
    max_stock: float = 0
    reorder_qty: float = 0
    lead_time_days: int = 7
    standard_cost: float = 0
    vat_pct: float = 14
    is_active: bool = True
    notes: Optional[str] = None

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    name_ar: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    unit_of_measure: Optional[str] = None
    item_type: Optional[str] = None
    preferred_vendor_id: Optional[str] = None
    min_stock: Optional[float] = None
    max_stock: Optional[float] = None
    reorder_qty: Optional[float] = None
    lead_time_days: Optional[int] = None
    standard_cost: Optional[float] = None
    last_purchase_cost: Optional[float] = None
    average_cost: Optional[float] = None
    vat_pct: Optional[float] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class InventoryItemResponse(BaseModel):
    id: str
    hotel_id: str
    item_code: str
    name: str
    name_ar: Optional[str]
    category: str
    subcategory: Optional[str]
    brand: Optional[str]
    model: Optional[str]
    unit_of_measure: str
    item_type: str
    is_stockable: bool
    preferred_vendor_id: Optional[str]
    min_stock: float
    max_stock: float
    reorder_qty: float
    lead_time_days: int
    standard_cost: float
    last_purchase_cost: float
    average_cost: float
    vat_pct: float
    is_active: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
