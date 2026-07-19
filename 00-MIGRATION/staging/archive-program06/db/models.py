"""New tables for PROGRAM-06. Added to existing ai_hub database."""
import uuid
from datetime import datetime
from sqlalchemy import String, JSON, Integer, DateTime, Text, Float, func, Index
from sqlalchemy.orm import Mapped, mapped_column
from src.db.engine import Base

def _uuid() -> str:
    return str(uuid.uuid4())

class ProjectSnapshot(Base):
    __tablename__ = "project_snapshots"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    workspace_id: Mapped[str] = mapped_column(String, index=True)
    snapshot_type: Mapped[str] = mapped_column(String, default="morning_briefing", index=True)
    snapshot_data: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (Index("ix_snapshots_ws_type", "workspace_id", "snapshot_type"),)


class SprintMetric(Base):
    __tablename__ = "sprint_metrics"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    workspace_id: Mapped[str] = mapped_column(String, index=True)
    sprint_name: Mapped[str] = mapped_column(String, default="")
    total_tasks: Mapped[int] = mapped_column(Integer, default=0)
    completed_tasks: Mapped[int] = mapped_column(Integer, default=0)
    failed_tasks: Mapped[int] = mapped_column(Integer, default=0)
    blocked_tasks: Mapped[int] = mapped_column(Integer, default=0)
    velocity_score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    workspace_id: Mapped[str] = mapped_column(String, index=True)
    task_id: Mapped[str] = mapped_column(String, default="", index=True)
    run_group: Mapped[str] = mapped_column(String, default="", index=True)
    stage: Mapped[str] = mapped_column(String, default="plan", index=True)
    stage_status: Mapped[str] = mapped_column(String, default="running")
    stage_input: Mapped[dict] = mapped_column(JSON, default=dict)
    stage_output: Mapped[dict] = mapped_column(JSON, default=dict)
    model_used: Mapped[str] = mapped_column(String, default="")
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (Index("ix_pipeline_runs_ws_stage", "workspace_id", "stage"),)


class PipelineArtifact(Base):
    __tablename__ = "pipeline_artifacts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    run_group: Mapped[str] = mapped_column(String, index=True)
    artifact_type: Mapped[str] = mapped_column(String, default="code_file")
    file_path: Mapped[str] = mapped_column(Text, default="")
    content: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PromptTemplate(Base):
    __tablename__ = "prompt_templates"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    template_name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    task_type: Mapped[str] = mapped_column(String, default="", index=True)
    template_content: Mapped[str] = mapped_column(Text, nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1)
    performance_score: Mapped[float] = mapped_column(Float, default=0.0)
    improvement_reason: Mapped[str] = mapped_column(Text, default="")
    last_improved_at: Mapped[object] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SprintRetrospective(Base):
    __tablename__ = "sprint_retrospectives"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    workspace_id: Mapped[str] = mapped_column(String, index=True)
    sprint_name: Mapped[str] = mapped_column(String, default="")
    total_tasks: Mapped[int] = mapped_column(Integer, default=0)
    success_rate: Mapped[float] = mapped_column(Float, default=0.0)
    avg_review_score: Mapped[float] = mapped_column(Float, default=0.0)
    top_failure_pattern: Mapped[str] = mapped_column(Text, default="")
    recommended_changes: Mapped[dict] = mapped_column(JSON, default=dict)
    adrs_created: Mapped[int] = mapped_column(Integer, default=0)
    prompts_updated: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
