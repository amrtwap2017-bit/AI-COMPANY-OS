# Triangle Black — Supplier Schemas (Sprint-209: Input Validation Hardening)
"""suppliers/schemas.py — Sprint-081 + Sprint-209 validation hardening"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

VALID_SUPPLIER_STATUSES  = {"active", "inactive", "suspended", "pending_approval", "blacklisted"}
VALID_RISK_LEVELS        = {"low", "medium", "high", "critical"}
VALID_PAYMENT_TERMS      = {"net_7", "net_14", "net_30", "net_60", "net_90", "immediate", "cod"}

class SupplierBase(BaseModel):
    company_name:   str            = Field(..., min_length=2, max_length=300)
    arabic_name:    Optional[str]  = Field(None, max_length=300)
    status:         str            = Field("active", max_length=30)
    supplier_type:  Optional[str]  = Field(None, max_length=100)
    payment_terms:  Optional[str]  = Field("net_30", max_length=30)
    lead_time_days: Optional[int]  = Field(7, ge=0, le=365)
    risk_level:     Optional[str]  = Field("low", max_length=20)
    city:           Optional[str]  = Field(None, max_length=100)
    country:        Optional[str]  = Field("Egypt", max_length=100)
    phone:          Optional[str]  = Field(None, max_length=50)
    email:          Optional[str]  = Field(None, max_length=320)
    category:       Optional[str]  = Field(None, max_length=100)
    rating:         Optional[float] = Field(0.0, ge=0.0, le=5.0)

    @field_validator("company_name")
    @classmethod
    def validate_company_name(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) < 2:
            raise ValueError("company_name must be at least 2 characters")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in VALID_SUPPLIER_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_SUPPLIER_STATUSES))}")
        return v

    @field_validator("risk_level")
    @classmethod
    def validate_risk_level(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_RISK_LEVELS:
            raise ValueError(f"risk_level must be one of: {', '.join(sorted(VALID_RISK_LEVELS))}")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("email must be a valid email address")
        return v

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v: Optional[float]) -> Optional[float]:
        if v is None:
            return v
        if v < 0 or v > 5:
            raise ValueError("rating must be between 0 and 5")
        return round(v, 1)

class SupplierCreate(SupplierBase):
    hotel_id:      Optional[str] = Field(None, max_length=100)
    supplier_code: Optional[str] = Field(None, max_length=50)

class SupplierUpdate(BaseModel):
    company_name:   Optional[str]  = Field(None, min_length=2, max_length=300)
    status:         Optional[str]  = Field(None, max_length=30)
    risk_level:     Optional[str]  = Field(None, max_length=20)
    rating:         Optional[float] = Field(None, ge=0.0, le=5.0)
    payment_terms:  Optional[str]  = Field(None, max_length=30)
    lead_time_days: Optional[int]  = Field(None, ge=0, le=365)
    phone:          Optional[str]  = Field(None, max_length=50)
    email:          Optional[str]  = Field(None, max_length=320)
    notes:          Optional[str]  = Field(None, max_length=5000)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_SUPPLIER_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_SUPPLIER_STATUSES))}")
        return v

    @field_validator("risk_level")
    @classmethod
    def validate_risk_level(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_RISK_LEVELS:
            raise ValueError(f"risk_level must be one of: {', '.join(sorted(VALID_RISK_LEVELS))}")
        return v

class SupplierResponse(SupplierBase):
    id:            Optional[str]      = None
    hotel_id:      Optional[str]      = None
    supplier_code: Optional[str]      = None
    created_at:    Optional[datetime] = None
    updated_at:    Optional[datetime] = None

    model_config = {"from_attributes": True}
