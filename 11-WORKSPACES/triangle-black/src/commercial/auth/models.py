from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Index
from src.core.base import Base


class User(Base):
    __tablename__ = "users"

    id              = Column(String(36), primary_key=True,
                             default=lambda: str(uuid.uuid4()))
    hotel_id        = Column(String(36), nullable=False,
                             default="tb-default-hotel-000000000001")
    name            = Column(String(255), nullable=False)
    email           = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False, default="")
    role            = Column(String(50),  nullable=False, default="agent")
    is_active       = Column(Boolean,     nullable=False, default=True)
    created_at      = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at      = Column(DateTime, default=datetime.utcnow,
                             onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_users_hotel_id", "hotel_id"),
    )
