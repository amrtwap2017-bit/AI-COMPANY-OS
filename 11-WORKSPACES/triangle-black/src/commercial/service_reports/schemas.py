from __future__ import annotations
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel

class ServiceReportCreate(BaseModel):
    work_order_id: str
    contract_id: Optional[str] = None
    site_id: Optional[str] = None
    asset_id: Optional[str] = None
    technician_id: Optional[str] = None
    work_performed: Optional[str] = None
    findings: Optional[str] = None
    parts_used: Optional[List[Any]] = None
    recommendations: Optional[str] = None
    follow_up_required: bool = False
    follow_up_notes: Optional[str] = None
    client_acknowledged: bool = False
    client_name: Optional[str] = None

class ServiceReportUpdate(BaseModel):
    work_performed: Optional[str] = None
    findings: Optional[str] = None
    parts_used: Optional[List[Any]] = None
    recommendations: Optional[str] = None
    follow_up_required: Optional[bool] = None
    follow_up_notes: Optional[str] = None
    client_acknowledged: Optional[bool] = None
    client_name: Optional[str] = None

class ServiceReportResponse(BaseModel):
    id: str
    hotel_id: str
    work_order_id: str
    contract_id: Optional[str]
    site_id: Optional[str]
    asset_id: Optional[str]
    technician_id: Optional[str]
    work_performed: Optional[str]
    findings: Optional[str]
    parts_used: Optional[List[Any]]
    recommendations: Optional[str]
    follow_up_required: bool
    follow_up_notes: Optional[str]
    client_acknowledged: bool
    client_name: Optional[str]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
