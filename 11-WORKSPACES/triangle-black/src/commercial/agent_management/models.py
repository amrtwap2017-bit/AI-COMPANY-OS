from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Index
from src.core.base import Base


class Agent(Base):
    __tablename__ = "agents"

    id         = Column(String(36), primary_key=True,
                        default=lambda: str(uuid.uuid4()))
    hotel_id   = Column(String(36), nullable=False,
                        default="tb-default-hotel-000000000001")
    name       = Column(String(255), nullable=False)
    max_leads  = Column(Integer, default=20)
    assigned_leads = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)

    @property
    def current_load(self) -> int:
        return self.assigned_leads

    __table_args__ = (
        Index("ix_agents_hotel_id", "hotel_id"),
    )