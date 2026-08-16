# Triangle Black — Quotation Schemas (Sprint-214: Input Validation Hardening)
from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, field_validator

VALID_QUOTE_STATUSES = {"draft", "submitted", "sent", "approved", "rejected", "expired", "converted"}

class QuoteCreate(BaseModel):
    lead_id:       Optional[str]       = Field(None, max_length=100)
    title:         str                 = Field(..., min_length=3, max_length=500)
    description:   Optional[str]       = Field(None, max_length=5000)
    items:         Optional[List[Any]] = None
    total:         float               = Field(0.0, ge=0.0)
    status:        str                 = Field("draft", max_length=30)
    validity_date: Optional[datetime]  = None

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
        if v not in VALID_QUOTE_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_QUOTE_STATUSES))}")
        return v

    @field_validator("total")
    @classmethod
    def validate_total(cls, v: float) -> float:
        if v < 0:
            raise ValueError("total cannot be negative")
        return round(v, 2)

class QuoteUpdate(BaseModel):
    lead_id:       Optional[str]       = Field(None, max_length=100)
    title:         Optional[str]       = Field(None, min_length=3, max_length=500)
    description:   Optional[str]       = Field(None, max_length=5000)
    items:         Optional[List[Any]] = None
    total:         Optional[float]     = Field(None, ge=0.0)
    status:        Optional[str]       = Field(None, max_length=30)
    validity_date: Optional[datetime]  = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_QUOTE_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_QUOTE_STATUSES))}")
        return v

class QuoteResponse(BaseModel):
    id:            Optional[str]       = None
    hotel_id:      Optional[str]       = None
    lead_id:       Optional[str]       = None
    title:         Optional[str]       = None
    description:   Optional[str]       = None
    items:         Optional[List[Any]] = None
    total:         Optional[float]     = None
    status:        Optional[str]       = None
    validity_date: Optional[datetime]  = None
    created_at:    Optional[datetime]  = None
    updated_at:    Optional[datetime]  = None

    model_config = {"from_attributes": True}
