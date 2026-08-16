# Triangle Black — Purchase Order Schemas (Sprint-212: Input Validation Hardening)
from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, field_validator

VALID_PO_STATUSES = {
    "draft", "pending_approval", "approved", "sent", "acknowledged",
    "partial", "received", "invoiced", "paid", "cancelled"
}

class PurchaseOrderCreate(BaseModel):
    vendor_id:       str             = Field(..., min_length=1, max_length=100)
    pr_id:           Optional[str]   = Field(None, max_length=100)
    expected_date:   Optional[datetime] = None
    lines:           List[Any]       = Field(default_factory=list)
    subtotal:        float           = Field(0.0, ge=0.0)
    vat_amount:      float           = Field(0.0, ge=0.0)
    total_amount:    float           = Field(0.0, ge=0.0)
    payment_terms:   Optional[str]   = Field(None, max_length=100)
    delivery_notes:  Optional[str]   = Field(None, max_length=2000)

    @field_validator("vendor_id")
    @classmethod
    def validate_vendor_id(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("vendor_id cannot be blank")
        return v

    @field_validator("subtotal", "vat_amount", "total_amount")
    @classmethod
    def validate_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("amount cannot be negative")
        return round(v, 2)

class PurchaseOrderUpdate(BaseModel):
    vendor_id:       Optional[str]   = Field(None, min_length=1, max_length=100)
    expected_date:   Optional[datetime] = None
    status:          Optional[str]   = Field(None, max_length=30)
    lines:           Optional[List[Any]] = None
    subtotal:        Optional[float] = Field(None, ge=0.0)
    vat_amount:      Optional[float] = Field(None, ge=0.0)
    total_amount:    Optional[float] = Field(None, ge=0.0)
    payment_terms:   Optional[str]   = Field(None, max_length=100)
    delivery_notes:  Optional[str]   = Field(None, max_length=2000)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_PO_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_PO_STATUSES))}")
        return v

class PurchaseOrderResponse(BaseModel):
    id:             Optional[str]      = None
    hotel_id:       Optional[str]      = None
    po_number:      Optional[str]      = None
    vendor_id:      Optional[str]      = None
    pr_id:          Optional[str]      = None
    status:         Optional[str]      = None
    expected_date:  Optional[datetime] = None
    lines:          Optional[List[Any]] = None
    subtotal:       Optional[float]    = None
    vat_amount:     Optional[float]    = None
    total_amount:   Optional[float]    = None
    payment_terms:  Optional[str]      = None
    delivery_notes: Optional[str]      = None
    approved_by:    Optional[str]      = None
    approved_at:    Optional[datetime] = None
    created_at:     Optional[datetime] = None
    updated_at:     Optional[datetime] = None

    model_config = {"from_attributes": True}
