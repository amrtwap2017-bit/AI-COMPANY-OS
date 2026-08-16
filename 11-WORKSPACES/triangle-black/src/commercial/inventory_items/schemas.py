# Triangle Black — Inventory Item Schemas (Sprint-213: Input Validation Hardening)
from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

VALID_ITEM_TYPES = {"spare_part", "consumable", "tool", "chemical", "uniform", "equipment", "material", "other"}
VALID_UOM        = {"piece", "unit", "kg", "g", "liter", "ml", "meter", "m2", "m3", "box", "pack", "roll", "set", "pair", "lot"}

class InventoryItemCreate(BaseModel):
    item_code:            str            = Field(..., min_length=1, max_length=100)
    name:                 str            = Field(..., min_length=2, max_length=300)
    name_ar:              Optional[str]  = Field(None, max_length=300)
    category:             str            = Field("general", max_length=100)
    subcategory:          Optional[str]  = Field(None, max_length=100)
    brand:                Optional[str]  = Field(None, max_length=200)
    model:                Optional[str]  = Field(None, max_length=200)
    unit_of_measure:      str            = Field("piece", max_length=30)
    item_type:            str            = Field("spare_part", max_length=50)
    is_stockable:         bool           = True
    preferred_vendor_id:  Optional[str]  = Field(None, max_length=100)
    min_stock:            float          = Field(0.0, ge=0.0)
    max_stock:            float          = Field(0.0, ge=0.0)
    reorder_qty:          float          = Field(0.0, ge=0.0)
    lead_time_days:       int            = Field(7, ge=0, le=365)
    standard_cost:        float          = Field(0.0, ge=0.0)
    vat_pct:              float          = Field(14.0, ge=0.0, le=100.0)
    is_active:            bool           = True
    notes:                Optional[str]  = Field(None, max_length=5000)

    @field_validator("item_code")
    @classmethod
    def validate_item_code(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("item_code cannot be blank")
        return v.upper()

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) < 2:
            raise ValueError("name must be at least 2 characters")
        return v

    @field_validator("item_type")
    @classmethod
    def validate_item_type(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in VALID_ITEM_TYPES:
            raise ValueError(f"item_type must be one of: {', '.join(sorted(VALID_ITEM_TYPES))}")
        return v

    @field_validator("unit_of_measure")
    @classmethod
    def validate_uom(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in VALID_UOM:
            raise ValueError(f"unit_of_measure must be one of: {', '.join(sorted(VALID_UOM))}")
        return v

    @field_validator("vat_pct")
    @classmethod
    def validate_vat(cls, v: float) -> float:
        if v < 0 or v > 100:
            raise ValueError("vat_pct must be between 0 and 100")
        return round(v, 2)

    @field_validator("standard_cost", "min_stock", "max_stock", "reorder_qty")
    @classmethod
    def validate_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("value cannot be negative")
        return round(v, 4)

class InventoryItemUpdate(BaseModel):
    name:                Optional[str]   = Field(None, min_length=2, max_length=300)
    name_ar:             Optional[str]   = Field(None, max_length=300)
    category:            Optional[str]   = Field(None, max_length=100)
    subcategory:         Optional[str]   = Field(None, max_length=100)
    brand:               Optional[str]   = Field(None, max_length=200)
    model:               Optional[str]   = Field(None, max_length=200)
    unit_of_measure:     Optional[str]   = Field(None, max_length=30)
    item_type:           Optional[str]   = Field(None, max_length=50)
    preferred_vendor_id: Optional[str]   = Field(None, max_length=100)
    min_stock:           Optional[float] = Field(None, ge=0.0)
    max_stock:           Optional[float] = Field(None, ge=0.0)
    reorder_qty:         Optional[float] = Field(None, ge=0.0)
    lead_time_days:      Optional[int]   = Field(None, ge=0, le=365)
    standard_cost:       Optional[float] = Field(None, ge=0.0)
    last_purchase_cost:  Optional[float] = Field(None, ge=0.0)
    average_cost:        Optional[float] = Field(None, ge=0.0)
    vat_pct:             Optional[float] = Field(None, ge=0.0, le=100.0)
    is_active:           Optional[bool]  = None
    notes:               Optional[str]   = Field(None, max_length=5000)

class InventoryItemResponse(BaseModel):
    id:                  Optional[str]   = None
    hotel_id:            Optional[str]   = None
    item_code:           Optional[str]   = None
    name:                Optional[str]   = None
    name_ar:             Optional[str]   = None
    category:            Optional[str]   = None
    subcategory:         Optional[str]   = None
    brand:               Optional[str]   = None
    model:               Optional[str]   = None
    unit_of_measure:     Optional[str]   = None
    item_type:           Optional[str]   = None
    is_stockable:        Optional[bool]  = None
    min_stock:           Optional[float] = None
    max_stock:           Optional[float] = None
    reorder_qty:         Optional[float] = None
    lead_time_days:      Optional[int]   = None
    standard_cost:       Optional[float] = None
    vat_pct:             Optional[float] = None
    is_active:           Optional[bool]  = None
    notes:               Optional[str]   = None
    created_at:          Optional[datetime] = None
    updated_at:          Optional[datetime] = None

    model_config = {"from_attributes": True}
