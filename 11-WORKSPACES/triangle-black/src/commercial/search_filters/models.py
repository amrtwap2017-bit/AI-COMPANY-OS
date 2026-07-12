from __future__ import annotations
from datetime import datetime


from datetime import datetime
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON
from src.core.base import Base

class LeadSearch(Base):
    __tablename__ = "lead_searches"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    filters = Column(JSON, nullable=False, default=dict)
    sort_by = Column(String(50), nullable=False, default="created_at")
    sort_order = Column(String(10), nullable=False, default="desc")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
