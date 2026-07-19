"""
app/models/db/workflow.py
─────────────────────────────────────────────────────
Records every workflow execution with full task graph.

Columns match the actual database schema exactly.
"""

from sqlalchemy import String, Text, Float, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class WorkflowRun(Base, TimestampMixin):
    __tablename__ = "workflow_runs"

    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True
    )
    name: Mapped[str] = mapped_column(
        String(500), nullable=False
    )
    goal: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(50), default="pending"
    )
    # pending | running | success | failed | cancelled
    task_count: Mapped[int] = mapped_column(
        Integer, default=0
    )
    completed_count: Mapped[int] = mapped_column(
        Integer, default=0
    )
    failed_count: Mapped[int] = mapped_column(
        Integer, default=0
    )
    duration_seconds: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    result_summary: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    task_results: Mapped[dict | None] = mapped_column(
        JSON, nullable=True
    )

    def __repr__(self) -> str:
        return (
            f"<WorkflowRun id={self.id} "
            f"name={self.name!r} "
            f"status={self.status!r}>"
        )
