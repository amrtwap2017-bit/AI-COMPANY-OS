"""
Employee Timesheets — Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal


WORK_TYPES = ["regular", "overtime", "sick", "vacation", "public_holiday", "training"]
STATUSES   = ["pending", "approved", "rejected"]


class TimesheetCreate(BaseModel):
    employee_id:    str
    work_date:      date
    work_type:      str = Field(default="regular")
    hours_worked:   Decimal = Field(ge=0, le=24)
    overtime_hours: Optional[Decimal] = Field(default=0, ge=0, le=24)
    notes:          Optional[str] = None


class TimesheetUpdate(BaseModel):
    work_type:      Optional[str]    = None
    hours_worked:   Optional[Decimal] = Field(default=None, ge=0, le=24)
    overtime_hours: Optional[Decimal] = Field(default=None, ge=0, le=24)
    notes:          Optional[str]    = None


class TimesheetApprove(BaseModel):
    approved_by: str


class TimesheetReject(BaseModel):
    approved_by:      str
    rejection_reason: str


class TimesheetOut(BaseModel):
    id:               str
    hotel_id:         str
    employee_id:      str
    work_date:        date
    work_type:        str
    hours_worked:     Decimal
    overtime_hours:   Optional[Decimal]
    notes:            Optional[str]
    status:           str
    approved_by:      Optional[str]
    approved_at:      Optional[datetime]
    rejection_reason: Optional[str]
    created_at:       datetime
    updated_at:       datetime

    class Config:
        from_attributes = True


class TimesheetSummary(BaseModel):
    employee_id:      str
    total_entries:    int
    total_hours:      float
    total_overtime:   float
    pending_count:    int
    approved_count:   int
    rejected_count:   int


class TimesheetListResponse(BaseModel):
    count:   int
    results: List[TimesheetOut]
