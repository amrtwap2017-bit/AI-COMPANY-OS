from __future__ import annotations

from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

"""
ServiceReport FastAPI router — Triangle Black
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .schemas import ServiceReportCreate, ServiceReportUpdate, ServiceReportResponse
from .repository import ServiceReportRepository

router = APIRouter(prefix="/service-reports", tags=["service-reports"])

@router.post("/", response_model=ServiceReportResponse, status_code=201)
def create(
    payload: ServiceReportCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    data = payload.model_dump()
    data["hotel_id"] = hotel_id
    return ServiceReportRepository(db).create(data)

@router.get("/", response_model=List[ServiceReportResponse])
def list_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    return ServiceReportRepository(db).list(skip=skip, limit=limit, hotel_id=hotel_id)

@router.get("/{report_id}", response_model=ServiceReportResponse)
def get(
    report_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = ServiceReportRepository(db).get(report_id, hotel_id=hotel_id)
    if not obj:
        raise HTTPException(status_code=404, detail="ServiceReport not found")
    return obj

@router.patch("/{report_id}", response_model=ServiceReportResponse)
def update(
    report_id: str,
    payload: ServiceReportUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id),
):
    obj = ServiceReportRepository(db).update(
        report_id, payload.model_dump(exclude_none=True), hotel_id=hotel_id
    )
    if not obj:
        raise HTTPException(status_code=404, detail="ServiceReport not found")
    return obj

@router.delete("/{report_id}", status_code=204)
def delete(
    report_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Depends(get_hotel_id),
):
    if not ServiceReportRepository(db).delete(report_id, hotel_id=hotel_id):
        raise HTTPException(status_code=404, detail="ServiceReport not found")
