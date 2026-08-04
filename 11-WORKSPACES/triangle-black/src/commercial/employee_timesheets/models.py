"""
Employee Timesheets — SQLAlchemy ORM
Bounded Context: HR Domain
Separate from time_entries (Operations/Work-Order domain)
"""
from sqlalchemy import Column, String, Numeric, Date, Text, Boolean, TIMESTAMP, Index
from sqlalchemy.sql import func
from src.core.base import Base
class Employee(Base):
import uuid


class EmployeeTimesheet(Base):
    __tablename__ = "employee_timesheets"

    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id    = Column(String, nullable=False, index=True)
    employee_id = Column(String, nullable=False, index=True)

    work_date   = Column(Date,    nullable=False, index=True)
    work_type   = Column(String,  nullable=False, default="regular")
    hours_worked= Column(Numeric(5, 2), nullable=False)
    overtime_hours = Column(Numeric(5, 2), nullable=True, default=0)

    notes       = Column(Text,    nullable=True)
    status      = Column(String,  nullable=False, default="pending")  # pending/approved/rejected
    approved_by = Column(String,  nullable=True)
    approved_at = Column(TIMESTAMP, nullable=True)
    rejection_reason = Column(Text, nullable=True)

    created_at  = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at  = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_emp_ts_hotel",    "hotel_id"),
        Index("idx_emp_ts_employee", "employee_id"),
        Index("idx_emp_ts_date",     "work_date"),
        Index("idx_emp_ts_status",   "status"),
    )
