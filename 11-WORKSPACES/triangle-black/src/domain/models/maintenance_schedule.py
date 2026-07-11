from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class MaintenanceSchedule(Base):
    __tablename__ = 'maintenance_schedules'
    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer)
    hotel_id = Column(Integer)
    frequency = Column(String)
    last_done = Column(Date)
    next_due = Column(Date)