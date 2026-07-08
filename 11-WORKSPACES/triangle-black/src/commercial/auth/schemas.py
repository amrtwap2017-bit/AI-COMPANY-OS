from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "agent"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
