# Triangle Black — Asset Schemas (Sprint-207: Input Validation Hardening)
from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

VALID_CRITICALITY   = {"critical", "high", "medium", "low"}
VALID_STATUS        = {"operational", "in_fault", "under_maintenance", "inactive", "decommissioned",
                       "Operational", "In Fault", "Under Maintenance", "Inactive"}
VALID_FREQUENCY     = {"daily", "weekly", "monthly", "quarterly", "semi_annual", "annual", "as_needed"}
VALID_CATEGORIES    = {"HVAC", "Electrical", "Plumbing", "Fire", "Mechanical", "Civil",
                       "IT", "Lift", "Pool", "Kitchen", "Laundry", "Generator", "Other"}

class AssetCreate(BaseModel):
    site_id:              str            = Field(..., min_length=1, max_length=100)
    category:             str            = Field(..., min_length=1, max_length=100)
    name:                 str            = Field(..., min_length=2, max_length=500)
    manufacturer:         Optional[str]  = Field(None, max_length=200)
    model:                Optional[str]  = Field(None, max_length=200)
    serial_number:        Optional[str]  = Field(None, max_length=200)
    location_description: Optional[str]  = Field(None, max_length=1000)
    service_frequency:    str            = Field("monthly", max_length=50)
    installation_date:    Optional[datetime] = None
    warranty_expiry:      Optional[datetime] = None
    criticality:          str            = Field("medium", max_length=20)
    status:               str            = Field("Operational", max_length=50)
    notes:                Optional[str]  = Field(None, max_length=5000)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) < 2:
            raise ValueError("name must be at least 2 characters")
        return v

    @field_validator("criticality")
    @classmethod
    def validate_criticality(cls, v: str) -> str:
        v_lower = v.lower().strip()
        if v_lower not in VALID_CRITICALITY:
            raise ValueError(f"criticality must be one of: {', '.join(sorted(VALID_CRITICALITY))}")
        return v_lower

    @field_validator("service_frequency")
    @classmethod
    def validate_frequency(cls, v: str) -> str:
        v_lower = v.lower().strip()
        if v_lower not in VALID_FREQUENCY:
            raise ValueError(f"service_frequency must be one of: {', '.join(sorted(VALID_FREQUENCY))}")
        return v_lower

class AssetUpdate(BaseModel):
    category:             Optional[str]     = Field(None, max_length=100)
    name:                 Optional[str]     = Field(None, min_length=2, max_length=500)
    manufacturer:         Optional[str]     = Field(None, max_length=200)
    model:                Optional[str]     = Field(None, max_length=200)
    serial_number:        Optional[str]     = Field(None, max_length=200)
    location_description: Optional[str]     = Field(None, max_length=1000)
    service_frequency:    Optional[str]     = Field(None, max_length=50)
    installation_date:    Optional[datetime] = None
    warranty_expiry:      Optional[datetime] = None
    criticality:          Optional[str]     = Field(None, max_length=20)
    status:               Optional[str]     = Field(None, max_length=50)
    notes:                Optional[str]     = Field(None, max_length=5000)

    @field_validator("criticality")
    @classmethod
    def validate_criticality(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v_lower = v.lower().strip()
        if v_lower not in VALID_CRITICALITY:
            raise ValueError(f"criticality must be one of: {', '.join(sorted(VALID_CRITICALITY))}")
        return v_lower

class AssetResponse(BaseModel):
    id:                   Optional[str]     = None
    hotel_id:             Optional[str]     = None
    site_id:              Optional[str]     = None
    category:             Optional[str]     = None
    name:                 Optional[str]     = None
    manufacturer:         Optional[str]     = None
    model:                Optional[str]     = None
    serial_number:        Optional[str]     = None
    location_description: Optional[str]     = None
    service_frequency:    Optional[str]     = None
    installation_date:    Optional[datetime] = None
    warranty_expiry:      Optional[datetime] = None
    criticality:          Optional[str]     = None
    status:               Optional[str]     = None
    notes:                Optional[str]     = None
    created_at:           Optional[datetime] = None
    updated_at:           Optional[datetime] = None

    model_config = {"from_attributes": True}
