# Triangle Black — Lead Schemas (Sprint-211: Input Validation Hardening)
from __future__ import annotations
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

VALID_LEAD_STATUSES   = {"new", "qualified", "proposal", "negotiation", "won", "lost", "cold", "warm", "hot"}
VALID_LEAD_PRIORITIES = {"critical", "high", "medium", "low"}
VALID_LEAD_SOURCES    = {"manual", "referral", "website", "exhibition", "cold_call", "social_media", "partner", "other"}

class LeadCreate(BaseModel):
    name:      str            = Field(..., min_length=2, max_length=200)
    company:   Optional[str]  = Field(None, max_length=300)
    phone:     Optional[str]  = Field(None, max_length=50)
    email:     Optional[str]  = Field(None, max_length=320)
    source:    str            = Field("manual", max_length=50)
    priority:  str            = Field("medium", max_length=20)
    status:    str            = Field("new", max_length=30)
    score:     int            = Field(0, ge=0, le=100)
    agent_id:  Optional[str]  = Field(None, max_length=100)
    hotel_id:  Optional[str]  = Field(None, max_length=100)
    notes:     Optional[str]  = Field(None, max_length=5000)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) < 2:
            raise ValueError("name must be at least 2 characters")
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

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in VALID_LEAD_PRIORITIES:
            raise ValueError(f"priority must be one of: {', '.join(sorted(VALID_LEAD_PRIORITIES))}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in VALID_LEAD_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_LEAD_STATUSES))}")
        return v

    @field_validator("source")
    @classmethod
    def validate_source(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in VALID_LEAD_SOURCES:
            raise ValueError(f"source must be one of: {', '.join(sorted(VALID_LEAD_SOURCES))}")
        return v

    @field_validator("score")
    @classmethod
    def validate_score(cls, v: int) -> int:
        if v < 0 or v > 100:
            raise ValueError("score must be between 0 and 100")
        return v

class LeadUpdate(BaseModel):
    name:     Optional[str]  = Field(None, min_length=2, max_length=200)
    company:  Optional[str]  = Field(None, max_length=300)
    phone:    Optional[str]  = Field(None, max_length=50)
    email:    Optional[str]  = Field(None, max_length=320)
    source:   Optional[str]  = Field(None, max_length=50)
    priority: Optional[str]  = Field(None, max_length=20)
    status:   Optional[str]  = Field(None, max_length=30)
    score:    Optional[int]  = Field(None, ge=0, le=100)
    agent_id: Optional[str]  = Field(None, max_length=100)
    notes:    Optional[str]  = Field(None, max_length=5000)

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_LEAD_PRIORITIES:
            raise ValueError(f"priority must be one of: {', '.join(sorted(VALID_LEAD_PRIORITIES))}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_LEAD_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_LEAD_STATUSES))}")
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

class LeadResponse(BaseModel):
    id:         Optional[str]      = None
    hotel_id:   Optional[str]      = None
    name:       Optional[str]      = None
    company:    Optional[str]      = None
    phone:      Optional[str]      = None
    email:      Optional[str]      = None
    source:     Optional[str]      = None
    priority:   Optional[str]      = None
    status:     Optional[str]      = None
    score:      Optional[int]      = None
    agent_id:   Optional[str]      = None
    notes:      Optional[str]      = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
