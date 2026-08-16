# Triangle Black — Invoice Schemas (Sprint-208: Input Validation Hardening)
from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

VALID_INVOICE_STATUSES = {"draft", "pending", "sent", "paid", "overdue", "cancelled", "disputed"}

class InvoiceCreate(BaseModel):
    hotel_id:       Optional[str]      = Field(None, max_length=100)
    invoice_number: str                = Field(..., min_length=1, max_length=100)
    total_amount:   float              = Field(..., ge=0.0)
    status:         str                = Field("pending", max_length=30)
    due_date:       Optional[datetime] = None
    description:    Optional[str]      = Field(None, max_length=5000)
    contract_id:    Optional[str]      = Field(None, max_length=100)
    work_order_id:  Optional[str]      = Field(None, max_length=100)
    tax_amount:     Optional[float]    = Field(None, ge=0.0)
    notes:          Optional[str]      = Field(None, max_length=5000)

    @field_validator("invoice_number")
    @classmethod
    def validate_invoice_number(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("invoice_number cannot be blank")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in VALID_INVOICE_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_INVOICE_STATUSES))}")
        return v

    @field_validator("total_amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v < 0:
            raise ValueError("total_amount cannot be negative")
        return round(v, 2)

class InvoiceUpdate(BaseModel):
    invoice_number: Optional[str]      = Field(None, max_length=100)
    total_amount:   Optional[float]    = Field(None, ge=0.0)
    status:         Optional[str]      = Field(None, max_length=30)
    due_date:       Optional[datetime] = None
    paid_date:      Optional[datetime] = None
    description:    Optional[str]      = Field(None, max_length=5000)
    notes:          Optional[str]      = Field(None, max_length=5000)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_INVOICE_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_INVOICE_STATUSES))}")
        return v

class InvoiceResponse(BaseModel):
    id:             Optional[str]      = None
    hotel_id:       Optional[str]      = None
    invoice_number: Optional[str]      = None
    total_amount:   Optional[float]    = None
    tax_amount:     Optional[float]    = None
    status:         Optional[str]      = None
    due_date:       Optional[datetime] = None
    paid_date:      Optional[datetime] = None
    description:    Optional[str]      = None
    contract_id:    Optional[str]      = None
    work_order_id:  Optional[str]      = None
    notes:          Optional[str]      = None
    created_at:     Optional[datetime] = None

    model_config = {"from_attributes": True}
