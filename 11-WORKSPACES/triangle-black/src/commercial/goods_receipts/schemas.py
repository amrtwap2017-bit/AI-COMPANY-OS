# Triangle Black — Goods Receipt Schemas (Sprint-213: Input Validation Hardening)
from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, field_validator

VALID_GRN_STATUSES = {"draft", "pending_inspection", "approved", "rejected", "partial", "complete"}

class GoodsReceiptCreate(BaseModel):
    po_id:         Optional[str]      = Field(None, max_length=100)
    vendor_id:     Optional[str]      = Field(None, max_length=100)
    warehouse_id:  str                = Field(..., min_length=1, max_length=100)
    received_date: Optional[datetime] = None
    lines:         List[Any]          = Field(default_factory=list)
    notes:         Optional[str]      = Field(None, max_length=5000)
    received_by:   Optional[str]      = Field(None, max_length=200)

    @field_validator("warehouse_id")
    @classmethod
    def validate_warehouse_id(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("warehouse_id cannot be blank")
        return v

class GoodsReceiptUpdate(BaseModel):
    status: Optional[str]      = Field(None, max_length=30)
    lines:  Optional[List[Any]] = None
    notes:  Optional[str]      = Field(None, max_length=5000)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_GRN_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_GRN_STATUSES))}")
        return v

class GoodsReceiptResponse(BaseModel):
    id:            Optional[str]      = None
    hotel_id:      Optional[str]      = None
    grn_number:    Optional[str]      = None
    po_id:         Optional[str]      = None
    vendor_id:     Optional[str]      = None
    warehouse_id:  Optional[str]      = None
    received_date: Optional[datetime] = None
    status:        Optional[str]      = None
    lines:         Optional[List[Any]] = None
    notes:         Optional[str]      = None
    received_by:   Optional[str]      = None
    created_at:    Optional[datetime] = None
    updated_at:    Optional[datetime] = None

    model_config = {"from_attributes": True}
