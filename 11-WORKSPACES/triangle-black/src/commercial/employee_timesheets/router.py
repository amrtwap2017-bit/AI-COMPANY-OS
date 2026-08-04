"""
Employee Timesheets — FastAPI Router
GET    /api/v1/timesheets/
POST   /api/v1/timesheets/
GET    /api/v1/timesheets/{id}
PATCH  /api/v1/timesheets/{id}
POST   /api/v1/timesheets/{id}/approve
POST   /api/v1/timesheets/{id}/reject
GET    /api/v1/timesheets/employee/{employee_id}/summary
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.employee_timesheets import repository as repo
from src.commercial.employee_timesheets.schemas import (
    TimesheetCreate, TimesheetUpdate, TimesheetOut,
    TimesheetApprove, TimesheetReject,
    TimesheetListResponse, TimesheetSummary
)

router = APIRouter(prefix="/timesheets", tags=["Employee Timesheets"])


@router.get("/", response_model=TimesheetListResponse)
def list_timesheets(
    employee_id: str = None,
    status: str = None,
    limit: int = 100,
    offset: int = 0,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    total, items = repo.list_timesheets(db, hotel_id, employee_id, status, limit, offset)
    return TimesheetListResponse(count=total, results=items)


@router.post("/", response_model=TimesheetOut, status_code=201)
def create_timesheet(
    data: TimesheetCreate,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return repo.create_timesheet(db, hotel_id, data)


@router.get("/employee/{employee_id}/summary", response_model=TimesheetSummary)
def get_employee_summary(
    employee_id: str,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return repo.get_summary(db, hotel_id, employee_id)


@router.get("/{ts_id}", response_model=TimesheetOut)
def get_timesheet(
    ts_id: str,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    entry = repo.get_timesheet(db, hotel_id, ts_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Timesheet not found")
    return entry


@router.patch("/{ts_id}", response_model=TimesheetOut)
def update_timesheet(
    ts_id: str,
    data: TimesheetUpdate,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    entry = repo.update_timesheet(db, hotel_id, ts_id, data)
    if not entry:
        raise HTTPException(status_code=404, detail="Timesheet not found")
    return entry


@router.post("/{ts_id}/approve", response_model=TimesheetOut)
def approve_timesheet(
    ts_id: str,
    data: TimesheetApprove,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    entry = repo.approve_timesheet(db, hotel_id, ts_id, data.approved_by)
    if not entry:
        raise HTTPException(status_code=404, detail="Timesheet not found")
    return entry


@router.post("/{ts_id}/reject", response_model=TimesheetOut)
def reject_timesheet(
    ts_id: str,
    data: TimesheetReject,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    entry = repo.reject_timesheet(db, hotel_id, ts_id, data.approved_by, data.rejection_reason)
    if not entry:
        raise HTTPException(status_code=404, detail="Timesheet not found")
    return entry
