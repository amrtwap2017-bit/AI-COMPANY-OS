"""ExecutionRun SQLAlchemy model — matches real DB schema exactly."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON, Integer
from hub.db.base import Base

class ExecutionRun(Base):
    __tablename__ = "execution_runs"
    id             = Column(String(36),  primary_key=True, default=lambda: str(uuid.uuid4()))
    run_group      = Column(String(36),  nullable=False, default="")
    task_id        = Column(String(36),  nullable=False, default="")
    workspace_id   = Column(String(36),  nullable=False, default="")
    project_id     = Column(String(36),  nullable=False, default="")
    stage          = Column(String(50),  nullable=False, default="")
    attempt        = Column(Integer,     nullable=False, default=1)
    ok             = Column(Integer,     nullable=False, default=0)
    duration_ms    = Column(Integer,     nullable=False, default=0)
    output_preview = Column(Text,        nullable=False, default="")
    error          = Column(Text,        nullable=False, default="")
    artifacts      = Column(JSON,        nullable=False, default=dict)
    quality_score  = Column(Integer,     nullable=False, default=0)
    ts             = Column(DateTime(timezone=True), default=datetime.utcnow)


class ApprovalGate(Base):
    __tablename__ = "approval_gates"
    id           = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_group    = Column(String(36), nullable=False, default="")
    task_id      = Column(String(36), nullable=False, default="")
    workspace_id = Column(String(36), nullable=False, default="")
    project_id   = Column(String(36), nullable=False, default="")
    gate_type    = Column(String(50), nullable=False, default="review")
    status       = Column(String(50), nullable=False, default="pending")
    approved_by  = Column(String(100), nullable=True)
    notes        = Column(Text, nullable=False, default="")
    created_at   = Column(DateTime(timezone=True), default=datetime.utcnow)
