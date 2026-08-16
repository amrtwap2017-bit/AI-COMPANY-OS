# Triangle Black — Employee Schemas (Sprint-209: Input Validation Hardening)
from __future__ import annotations
from pydantic import BaseModel, Field, field_validator, EmailStr
from typing import Optional
from datetime import datetime
import re

VALID_EMPLOYEE_STATUSES = {"active", "inactive", "on_leave", "terminated", "probation"}

class EmployeeCreate(BaseModel):
    name:        str             = Field(..., min_length=2, max_length=200)
    email:       Optional[str]   = Field(None, max_length=320)
    phone:       Optional[str]   = Field(None, max_length=50)
    department:  Optional[str]   = Field(None, max_length=100)
    position:    Optional[str]   = Field(None, max_length=200)
    employee_id: Optional[str]   = Field(None, max_length=50)
    hire_date:   Optional[datetime] = None
    salary:      Optional[float] = Field(None, ge=0.0)
    status:      Optional[str]   = Field("active", max_length=30)

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
        if len(v) > 320:
            raise ValueError("email too long")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        cleaned = re.sub(r'[\s\-\+\(\)]', '', v)
        if len(cleaned) < 7 or not cleaned.lstrip('+').isdigit():
            raise ValueError("phone must be a valid phone number")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_EMPLOYEE_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_EMPLOYEE_STATUSES))}")
        return v

    @field_validator("salary")
    @classmethod
    def validate_salary(cls, v: Optional[float]) -> Optional[float]:
        if v is None:
            return v
        if v < 0:
            raise ValueError("salary cannot be negative")
        return round(v, 2)

class EmployeeUpdate(BaseModel):
    name:       Optional[str]    = Field(None, min_length=2, max_length=200)
    email:      Optional[str]    = Field(None, max_length=320)
    phone:      Optional[str]    = Field(None, max_length=50)
    department: Optional[str]    = Field(None, max_length=100)
    position:   Optional[str]    = Field(None, max_length=200)
    status:     Optional[str]    = Field(None, max_length=30)
    salary:     Optional[float]  = Field(None, ge=0.0)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in VALID_EMPLOYEE_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_EMPLOYEE_STATUSES))}")
        return v

class EmployeeResponse(BaseModel):
    id:          Optional[str]      = None
    hotel_id:    Optional[str]      = None
    name:        Optional[str]      = None
    email:       Optional[str]      = None
    phone:       Optional[str]      = None
    department:  Optional[str]      = None
    position:    Optional[str]      = None
    employee_id: Optional[str]      = None
    status:      Optional[str]      = None
    salary:      Optional[float]    = None
    is_active:   Optional[bool]     = None
    created_at:  Optional[datetime] = None

    model_config = {"from_attributes": True}
