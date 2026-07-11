from sqlalchemy import Column, String, DateTime, Float, Integer
from sqlalchemy.ext.declarative import declarative_base
from src.core.base import Base

Base = declarative_base()

class Project(Base):
    __tablename__ = 'projects'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id = Column(String(36), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    budget = Column(Float, nullable=False)
    status = Column(String, nullable=False)
    completion_pct = Column(Integer, nullable=False)
    manager_id = Column(String(36), nullable=False)