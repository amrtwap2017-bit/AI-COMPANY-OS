from datetime import datetime
import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime
from src.core.base import Base, SoftDeleteMixin

class Lead(SoftDeleteMixin, Base):
    __tablename__ = "leads"
    __table_args__ = {"extend_existing": True}
    id         = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id   = Column(String(36), nullable=False)
    name       = Column(String(255), nullable=False)
    company    = Column(String(255), nullable=True)
    phone      = Column(String(50), nullable=True)
    email      = Column(String(255), nullable=False)
    source     = Column(String(50), nullable=False)
    priority   = Column(String(20), nullable=False)
    status     = Column(String(50), nullable=False)
    score      = Column(Integer, nullable=False, default=0)
    notes      = Column(Text, nullable=True)
    agent_id   = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
