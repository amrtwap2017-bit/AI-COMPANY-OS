# Triangle Black — Contract Schemas (Sprint-208: Input Validation Hardening)
from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, field_validator

VALID_CONTRACT_STATUSES = {
    "draft", "pending_signature", "active", "expired",
    "cancelled", "suspended", "renewed"
}

class ContractCreate(BaseModel):
    quote_id:        Optional[str]       = Field(None, max_length=100)
    lead_id:         Optional[str]       = Field(None, max_length=100)
    title:           str                 = Field(..., min_length=3, max_length=500)
    description:     Optional[str]       = Field(None, max_length=5000)
    services:        Optional[List[Any]] = None
    total_value:     float               = Field(0.0, ge=0.0)
    monthly_value:   float               = Field(0.0, ge=0.0)
    status:          str                 = Field("pending_signature", max_length=50)
    start_date:      Optional[datetime]  = None
    end_date:        Optional[datetime]  = None
    duration_months: int                 = Field(12, ge=1, le=120)
    renewal_count:   int                 = Field(0, ge=0)
    notes:           Optional[str]       = Field(None, max_length=5000)

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) < 3:
            raise ValueError("title must be at least 3 characters")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in VALID_CONTRACT_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_CONTRACT_STATUSES))}")
        return v

    @field_validator("total_value", "monthly_value")
    @classmethod
    def validate_positive_value(cls, v: float) -> float:
        if v < 0:
            raise ValueError("value cannot be negative")
        return round(v, 2)

class ContractUpdate(BaseModel):
    title:           Optional[str]       = Field(None, min_length=3, max_length=500)
    description:     Optional[str]       = Field(None, max_length=5000)
    services:        Optional[List[Any]] = None
    total_value:     Optional[float]     = Field(None, ge=0.0)
    monthly_value:   Optional[float]     = Field(None, ge=0.0)
    status:          Optional[str]       = Field(None, max_length=50)
    start_date:      Optional[datetime]  = None
    end_date:        Optional[datetime]  = None
    duration_months: Optional[int]       = Field(None, ge=1, le=120)
    renewal_count:   Optional[int]       = Field(None, ge=0)
    notes:           Optional[str]       = Field(None, max_length=5000)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_CONTRACT_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_CONTRACT_STATUSES))}")
        return v

class ContractResponse(BaseModel):
    id:              Optional[str]       = None
    hotel_id:        Optional[str]       = None
    quote_id:        Optional[str]       = None
    lead_id:         Optional[str]       = None
    title:           Optional[str]       = None
    description:     Optional[str]       = None
    services:        Optional[List[Any]] = None
    total_value:     Optional[float]     = None
    monthly_value:   Optional[float]     = None
    status:          Optional[str]       = None
    start_date:      Optional[datetime]  = None
    end_date:        Optional[datetime]  = None
    duration_months: Optional[int]       = None
    renewal_count:   Optional[int]       = None
    notes:           Optional[str]       = None
    created_at:      Optional[datetime]  = None

    model_config = {"from_attributes": True}
