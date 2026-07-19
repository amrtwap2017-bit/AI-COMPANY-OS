"""Memory SQLAlchemy model — matches real DB schema exactly."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON
from hub.db.base import Base

class Memory(Base):
    __tablename__ = "memories"
    id           = Column(String(36),  primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36),  nullable=False, default="")
    project_id   = Column(String(36),  nullable=False, default="")
    run_group    = Column(String(36),  nullable=False, default="")
    memory_type  = Column(String(50),  nullable=False, default="architecture")
    subject      = Column(String(500), nullable=False, default="")
    content      = Column(Text,        nullable=False, default="")
    extra_meta   = Column(JSON,        nullable=False, default=dict)
    expires_at   = Column(DateTime(timezone=True), nullable=True)
    created_at   = Column(DateTime(timezone=True), default=datetime.utcnow)
