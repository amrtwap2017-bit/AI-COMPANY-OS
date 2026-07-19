"""
app/models/db/project.py
─────────────────────────────────────────────────────
A Project is the highest-level autonomous execution unit.

Columns match the actual database schema exactly.
"""

from sqlalchemy import String, Text, Float, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True
    )
    name: Mapped[str] = mapped_column(
        String(500), nullable=False
    )
    goal: Mapped[str] = mapped_column(
        Text, nullable=False
    )
    description: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(50), default="pending"
    )
    # pending | running | complete | failed
    owner: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    plan: Mapped[dict | None] = mapped_column(
        JSON, nullable=True
    )
    workflow_run_id: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    task_results: Mapped[dict | None] = mapped_column(
        JSON, nullable=True
    )
    eval_score: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    eval_feedback: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    critic_feedback: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    final_report: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    result: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    duration_seconds: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    agent_name: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    model_used: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )

    def __repr__(self) -> str:
        return (
            f"<Project id={self.id} "
            f"name={self.name!r} "
            f"status={self.status!r}>"
        )
