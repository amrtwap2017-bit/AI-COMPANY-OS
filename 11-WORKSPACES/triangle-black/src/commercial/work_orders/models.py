from sqlalchemy import Column, Integer, String, DateTime, Boolean
from src.core.base import Base, SoftDeleteMixin

class WorkOrder(SoftDeleteMixin, Base):
    __tablename__ = 'work_orders'
    id = Column(Integer, primary_key=True)
    hotel_id = Column(String(36), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    technician_id = Column(String(36), nullable=True)
    due_date = Column(DateTime, nullable=False)
    status = Column(String, nullable=False)
    # SLA tracking (T-003)
    sla_hours = Column(Integer, default=24, nullable=True)
    sla_breach_at = Column(DateTime, nullable=True)
    sla_breached = Column(Boolean, default=False, nullable=True)
    sla_status = Column(String(20), default="on_track", nullable=True)
