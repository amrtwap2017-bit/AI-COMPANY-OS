# Triangle Black — Warehouse Schemas (Sprint-214: Input Validation Hardening)
from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

VALID_WAREHOUSE_TYPES = {"main", "satellite", "staging", "cold_storage", "hazmat", "transit", "archive"}

class WarehouseCreate(BaseModel):
    code:          str            = Field(..., min_length=1, max_length=50)
    name:          str            = Field(..., min_length=2, max_length=200)
    type:          str            = Field("main", max_length=50)
    address:       Optional[str]  = Field(None, max_length=500)
    manager_name:  Optional[str]  = Field(None, max_length=200)
    is_active:     bool           = True
    notes:         Optional[str]  = Field(None, max_length=5000)

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        v = v.strip().upper()
        if not v:
            raise ValueError("code cannot be blank")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) < 2:
            raise ValueError("name must be at least 2 characters")
        return v

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in VALID_WAREHOUSE_TYPES:
            raise ValueError(f"type must be one of: {', '.join(sorted(VALID_WAREHOUSE_TYPES))}")
        return v

class WarehouseUpdate(BaseModel):
    name:          Optional[str]  = Field(None, min_length=2, max_length=200)
    type:          Optional[str]  = Field(None, max_length=50)
    address:       Optional[str]  = Field(None, max_length=500)
    manager_name:  Optional[str]  = Field(None, max_length=200)
    is_active:     Optional[bool] = None
    notes:         Optional[str]  = Field(None, max_length=5000)

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_WAREHOUSE_TYPES:
            raise ValueError(f"type must be one of: {', '.join(sorted(VALID_WAREHOUSE_TYPES))}")
        return v

class WarehouseResponse(BaseModel):
    id:            Optional[str]      = None
    hotel_id:      Optional[str]      = None
    code:          Optional[str]      = None
    name:          Optional[str]      = None
    type:          Optional[str]      = None
    address:       Optional[str]      = None
    manager_name:  Optional[str]      = None
    is_active:     Optional[bool]     = None
    notes:         Optional[str]      = None
    created_at:    Optional[datetime] = None
    updated_at:    Optional[datetime] = None

    model_config = {"from_attributes": True}
