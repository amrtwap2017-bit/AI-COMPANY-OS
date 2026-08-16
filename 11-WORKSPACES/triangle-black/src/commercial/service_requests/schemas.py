# Triangle Black — Service Request Schemas (Sprint-212: Input Validation Hardening)
from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

VALID_SR_STATUSES   = {"open", "in_progress", "resolved", "closed", "cancelled", "escalated"}
VALID_SR_URGENCIES  = {"emergency", "critical", "high", "normal", "low"}
VALID_SR_CATEGORIES = {"HVAC", "Electrical", "Plumbing", "Fire", "Mechanical", "Civil",
                       "IT", "Housekeeping", "General", "Safety", "Other",
                       "hvac", "electrical", "plumbing", "fire", "mechanical", "civil",
                       "it", "housekeeping", "general", "safety", "other"}

class ServiceRequestCreate(BaseModel):
    title:          str            = Field(..., min_length=3, max_length=500)
    category:       str            = Field("general", max_length=100)
    urgency:        str            = Field("normal", max_length=20)
    contract_id:    Optional[str]  = Field(None, max_length=100)
    site_id:        Optional[str]  = Field(None, max_length=100)
    submitted_by:   Optional[str]  = Field(None, max_length=200)
    contact_phone:  Optional[str]  = Field(None, max_length=50)
    description:    Optional[str]  = Field(None, max_length=5000)
    preferred_date: Optional[datetime] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) < 3:
            raise ValueError("title must be at least 3 characters")
        return v

    @field_validator("urgency")
    @classmethod
    def validate_urgency(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in VALID_SR_URGENCIES:
            raise ValueError(f"urgency must be one of: {', '.join(sorted(VALID_SR_URGENCIES))}")
        return v

class ServiceRequestUpdate(BaseModel):
    title:             Optional[str]      = Field(None, min_length=3, max_length=500)
    category:          Optional[str]      = Field(None, max_length=100)
    urgency:           Optional[str]      = Field(None, max_length=20)
    status:            Optional[str]      = Field(None, max_length=30)
    work_order_id:     Optional[str]      = Field(None, max_length=100)
    resolution_notes:  Optional[str]      = Field(None, max_length=5000)
    resolved_at:       Optional[datetime] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_SR_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_SR_STATUSES))}")
        return v

    @field_validator("urgency")
    @classmethod
    def validate_urgency(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_SR_URGENCIES:
            raise ValueError(f"urgency must be one of: {', '.join(sorted(VALID_SR_URGENCIES))}")
        return v

class ServiceRequestResponse(BaseModel):
    id:               Optional[str]      = None
    hotel_id:         Optional[str]      = None
    contract_id:      Optional[str]      = None
    site_id:          Optional[str]      = None
    work_order_id:    Optional[str]      = None
    submitted_by:     Optional[str]      = None
    contact_phone:    Optional[str]      = None
    category:         Optional[str]      = None
    urgency:          Optional[str]      = None
    status:           Optional[str]      = None
    title:            Optional[str]      = None
    description:      Optional[str]      = None
    preferred_date:   Optional[datetime] = None
    resolved_at:      Optional[datetime] = None
    resolution_notes: Optional[str]      = None
    created_at:       Optional[datetime] = None
    updated_at:       Optional[datetime] = None

    model_config = {"from_attributes": True}
