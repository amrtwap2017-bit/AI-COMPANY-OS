from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class StockMovementCreate(BaseModel):
    item_id: str
    warehouse_id: str
    movement_type: str
    qty: float
    unit_cost: float = 0
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None

class StockMovementResponse(BaseModel):
    id: str
    hotel_id: str
    movement_number: str
    item_id: str
    warehouse_id: str
    movement_type: str
    qty: float
    unit_cost: float
    total_cost: float
    qty_before: float
    qty_after: float
    reference_type: Optional[str]
    reference_id: Optional[str]
    reason: Optional[str]
    notes: Optional[str]
    created_by: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True
