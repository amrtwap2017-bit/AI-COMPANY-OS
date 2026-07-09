from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Float, Index
from src.core.base import Base


class Pipeline(Base):
    __tablename__ = "pipelines"

    id         = Column(String(36), primary_key=True,
                        default=lambda: str(uuid.uuid4()))
    hotel_id   = Column(String(36), nullable=False,
                        default="tb-default-hotel-000000000001")
    stage      = Column(String(50), nullable=False)
    quote_total= Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_pipelines_hotel_id", "hotel_id"),
    )