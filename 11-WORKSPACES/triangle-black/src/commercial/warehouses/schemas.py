from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class WarehouseCreate(BaseModel):
    code: str
    name: str
    type: str = "main"
    address: Optional[str] = None
    manager_name: Optional[str] = None
    is_active: bool = True
    notes: Optional[str] = None

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    address: Optional[str] = None
    manager_name: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class WarehouseResponse(BaseModel):
    id: str
    hotel_id: str
    code: str
    name: str
    type: str
    address: Optional[str]
    manager_name: Optional[str]
    is_active: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
