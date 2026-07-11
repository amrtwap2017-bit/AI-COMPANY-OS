from sqlalchemy import Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from src.core.base import Base

Base = declarative_base()

class Lead(Base):
    __tablename__ = 'leads'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id = Column(String(36), nullable=False)
    name = Column(String, nullable=False)
    company = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    source = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    status = Column(String, nullable=False)
    agent_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)