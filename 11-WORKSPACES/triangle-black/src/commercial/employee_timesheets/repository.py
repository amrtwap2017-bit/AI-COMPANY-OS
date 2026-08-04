"""
Employee Timesheets — Repository (Data Access + Business Logic)
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime
from typing import Optional, List

from src.commercial.employee_timesheets.models import EmployeeTimesheet
from src.commercial.employee_timesheets.schemas import (
    TimesheetCreate, TimesheetUpdate, TimesheetSummary
)
import uuid


def create_timesheet(db: Session, hotel_id: str, data: TimesheetCreate) -> EmployeeTimesheet:
    entry = EmployeeTimesheet(
        id=str(uuid.uuid4()),
        hotel_id=hotel_id,
        employee_id=data.employee_id,
        work_date=data.work_date,
        work_type=data.work_type,
        hours_worked=data.hours_worked,
        overtime_hours=data.overtime_hours or 0,
        notes=data.notes,
        status="pending",
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_timesheet(db: Session, hotel_id: str, ts_id: str) -> Optional[EmployeeTimesheet]:
    return db.query(EmployeeTimesheet).filter(
        EmployeeTimesheet.id == ts_id,
        EmployeeTimesheet.hotel_id == hotel_id
    ).first()


def list_timesheets(
    db: Session,
    hotel_id: str,
    employee_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> tuple[int, List[EmployeeTimesheet]]:
    q = db.query(EmployeeTimesheet).filter(EmployeeTimesheet.hotel_id == hotel_id)
    if employee_id:
        q = q.filter(EmployeeTimesheet.employee_id == employee_id)
    if status:
        q = q.filter(EmployeeTimesheet.status == status)
    total = q.count()
    items = q.order_by(EmployeeTimesheet.work_date.desc()).offset(offset).limit(limit).all()
    return total, items


def update_timesheet(
    db: Session, hotel_id: str, ts_id: str, data: TimesheetUpdate
) -> Optional[EmployeeTimesheet]:
    entry = get_timesheet(db, hotel_id, ts_id)
    if not entry:
        return None
    if data.work_type is not None:
        entry.work_type = data.work_type
    if data.hours_worked is not None:
        entry.hours_worked = data.hours_worked
    if data.overtime_hours is not None:
        entry.overtime_hours = data.overtime_hours
    if data.notes is not None:
        entry.notes = data.notes
    db.commit()
    db.refresh(entry)
    return entry


def approve_timesheet(
    db: Session, hotel_id: str, ts_id: str, approved_by: str
) -> Optional[EmployeeTimesheet]:
    entry = get_timesheet(db, hotel_id, ts_id)
    if not entry:
        return None
    entry.status = "approved"
    entry.approved_by = approved_by
    entry.approved_at = datetime.utcnow()
    entry.rejection_reason = None
    db.commit()
    db.refresh(entry)
    return entry


def reject_timesheet(
    db: Session, hotel_id: str, ts_id: str, approved_by: str, reason: str
) -> Optional[EmployeeTimesheet]:
    entry = get_timesheet(db, hotel_id, ts_id)
    if not entry:
        return None
    entry.status = "rejected"
    entry.approved_by = approved_by
    entry.approved_at = datetime.utcnow()
    entry.rejection_reason = reason
    db.commit()
    db.refresh(entry)
    return entry


def get_summary(db: Session, hotel_id: str, employee_id: str) -> TimesheetSummary:
    q = db.query(EmployeeTimesheet).filter(
        EmployeeTimesheet.hotel_id == hotel_id,
        EmployeeTimesheet.employee_id == employee_id
    )
    all_entries = q.all()
    return TimesheetSummary(
        employee_id=employee_id,
        total_entries=len(all_entries),
        total_hours=float(sum(e.hours_worked for e in all_entries)),
        total_overtime=float(sum(e.overtime_hours or 0 for e in all_entries)),
        pending_count=sum(1 for e in all_entries if e.status == "pending"),
        approved_count=sum(1 for e in all_entries if e.status == "approved"),
        rejected_count=sum(1 for e in all_entries if e.status == "rejected"),
    )
