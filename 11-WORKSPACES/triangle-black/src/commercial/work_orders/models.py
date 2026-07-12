from sqlalchemy import Column, Integer, String, DateTime
from src.core.base import Base

class WorkOrder(Base):
    __tablename__ = 'work_orders'
    id = Column(Integer, primary_key=True)
    hotel_id = Column(String(36), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    technician_id = Column(String(36), nullable=True)
    due_date = Column(DateTime, nullable=False)
    status = Column(String, nullable=False)
