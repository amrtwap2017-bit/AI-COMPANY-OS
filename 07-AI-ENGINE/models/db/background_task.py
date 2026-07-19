"""
app/models/db/background_task.py
────────────────────────────────────────────────────────────────
Stores background task records.
Every long-running operation is tracked here.

Status lifecycle:
  pending → running → complete
                    → failed
                    → cancelled
"""

from __future__ import annotations

from sqlalchemy import String, Text, Float, Integer, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class BackgroundTask(Base, TimestampMixin):
    __tablename__ = "background_tasks"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )

    # Task identity
    task_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )
    # project_run | dag_run | workflow_run | collaboration_run
    # knowledge_ingest | learning_run | news_ingest

    task_name: Mapped[str] = mapped_column(
        String(255), nullable=False
    )

    # Execution state
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending"
    )
    # pending | running | complete | failed | cancelled

    # Input parameters stored as JSON
    params: Mapped[dict | None] = mapped_column(
        JSON, nullable=True
    )

    # Result reference (ID in the relevant table)
    result_id: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    # Error message if failed
    error: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    # Timing
    started_at:   Mapped[str | None] = mapped_column(String(50), nullable=True)
    completed_at: Mapped[str | None] = mapped_column(String(50), nullable=True)
    duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Progress (0.0 to 1.0)
    progress: Mapped[float] = mapped_column(Float, default=0.0)
    progress_message: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Who submitted
    submitted_by: Mapped[str | None] = mapped_column(String(100), nullable=True)

    __table_args__ = (
        Index("ix_background_tasks_status",     "status"),
        Index("ix_background_tasks_task_type",  "task_type"),
        Index("ix_background_tasks_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<BackgroundTask id={self.id} "
            f"type={self.task_type!r} "
            f"status={self.status!r}>"
        )
