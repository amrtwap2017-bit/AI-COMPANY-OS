from __future__ import annotations
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EmployeeCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    employee_id: Optional[str] = None
    hire_date: Optional[datetime] = None
    salary: Optional[float] = None

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    status: Optional[str] = None
    salary: Optional[float] = None

class EmployeeResponse(BaseModel):
    id: str
    hotel_id: str
    name: str
    email: Optional[str]
    phone: Optional[str]
    department: Optional[str]
    position: Optional[str]
    employee_id: Optional[str]
    status: str
    salary: Optional[float]
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True
