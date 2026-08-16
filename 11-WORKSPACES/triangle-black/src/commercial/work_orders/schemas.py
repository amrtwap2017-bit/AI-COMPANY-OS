# Triangle Black — Work Order Schemas (Sprint-206: Input Validation Hardening)
from __future__ import annotations
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator
import re

VALID_PRIORITIES = {"critical", "high", "medium", "low"}
VALID_STATUSES   = {"open", "in_progress", "completed", "cancelled", "on_hold"}
VALID_TYPES      = {"corrective", "preventive", "inspection", "emergency", "planned"}

class WorkOrderCreate(BaseModel):
    hotel_id:       Optional[str]  = Field(None, max_length=100)
    title:          str            = Field(..., min_length=3, max_length=500)
    description:    Optional[str]  = Field(None, max_length=5000)
    priority:       str            = Field("medium", max_length=20)
    type:           Optional[str]  = Field("corrective", max_length=50)
    technician_id:  Optional[str]  = Field(None, max_length=100)
    due_date:       Optional[str]  = Field(None, max_length=50)
    status:         Optional[str]  = Field("open", max_length=30)
    site_id:        Optional[str]  = Field(None, max_length=100)
    asset_id:       Optional[str]  = Field(None, max_length=100)
    notes:          Optional[str]  = Field(None, max_length=5000)

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in VALID_PRIORITIES:
            raise ValueError(f"priority must be one of: {', '.join(sorted(VALID_PRIORITIES))}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_STATUSES))}")
        return v

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_TYPES:
            raise ValueError(f"type must be one of: {', '.join(sorted(VALID_TYPES))}")
        return v

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("title cannot be blank")
        if len(v) < 3:
            raise ValueError("title must be at least 3 characters")
        return v

class WorkOrderUpdate(BaseModel):
    title:          Optional[str]  = Field(None, min_length=3, max_length=500)
    description:    Optional[str]  = Field(None, max_length=5000)
    priority:       Optional[str]  = Field(None, max_length=20)
    type:           Optional[str]  = Field(None, max_length=50)
    technician_id:  Optional[str]  = Field(None, max_length=100)
    due_date:       Optional[str]  = Field(None, max_length=50)
    status:         Optional[str]  = Field(None, max_length=30)
    notes:          Optional[str]  = Field(None, max_length=5000)
    completed_at:   Optional[str]  = Field(None, max_length=50)

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_PRIORITIES:
            raise ValueError(f"priority must be one of: {', '.join(sorted(VALID_PRIORITIES))}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_STATUSES))}")
        return v

class WorkOrderResponse(BaseModel):
    id:             Optional[str]  = None
    hotel_id:       Optional[str]  = None
    title:          Optional[str]  = None
    description:    Optional[str]  = None
    priority:       Optional[str]  = None
    type:           Optional[str]  = None
    technician_id:  Optional[str]  = None
    due_date:       Optional[str]  = None
    status:         Optional[str]  = None
    site_id:        Optional[str]  = None
    asset_id:       Optional[str]  = None
    notes:          Optional[str]  = None
    created_at:     Optional[str]  = None
    updated_at:     Optional[str]  = None

    model_config = {"from_attributes": True}
