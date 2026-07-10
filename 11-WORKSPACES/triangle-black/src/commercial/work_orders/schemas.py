from __future__ import annotations
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel

class WorkOrderCreate(BaseModel):
    title: str
    type: str = "preventive_maintenance"
    priority: str = "medium"
    contract_id: Optional[str] = None
    site_id: Optional[str] = None
    asset_id: Optional[str] = None
    technician_id: Optional[str] = None
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    checklist: Optional[List[Any]] = None

class WorkOrderUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    technician_id: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    issue_summary: Optional[str] = None
    resolution_summary: Optional[str] = None
    recommendations: Optional[str] = None
    checklist: Optional[List[Any]] = None

class WorkOrderResponse(BaseModel):
    id: str
    hotel_id: str
    work_order_number: str
    contract_id: Optional[str]
    site_id: Optional[str]
    asset_id: Optional[str]
    technician_id: Optional[str]
    type: str
    priority: str
    status: str
    title: str
    description: Optional[str]
    scheduled_date: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    issue_summary: Optional[str]
    resolution_summary: Optional[str]
    recommendations: Optional[str]
    checklist: Optional[List[Any]]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
