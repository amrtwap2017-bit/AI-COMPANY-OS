"""
app/models/db/reflection.py
────────────────────────────────────────────────────────────────
Stores reflection results after every significant execution.
Append-only — reflections are never updated or deleted.
"""

from sqlalchemy import String, Text, Float, Integer, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class Reflection(Base, TimestampMixin):
    __tablename__ = "reflections"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )

    # What was reflected on
    agent_name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    model_used: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    task: Mapped[str] = mapped_column(
        Text, nullable=False
    )

    # Outcome
    status: Mapped[str] = mapped_column(
        String(50), nullable=False
    )
    success: Mapped[bool] = mapped_column(
        default=True
    )

    # Analysis
    quality_score: Mapped[float] = mapped_column(
        Float, default=0.5
    )
    speed_rating: Mapped[str] = mapped_column(
        String(20), default="normal"
    )
    failure_reason: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    # Lessons learned
    lessons: Mapped[dict | None] = mapped_column(
        JSON, nullable=True, default=list
    )
    improvements: Mapped[dict | None] = mapped_column(
        JSON, nullable=True, default=list
    )

    # Execution metadata
    duration_seconds: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    project_id: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    conversation_id: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    __table_args__ = (
        Index("ix_reflections_agent_name", "agent_name"),
        Index("ix_reflections_status", "status"),
        Index("ix_reflections_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<Reflection id={self.id} "
            f"agent={self.agent_name!r} "
            f"quality={self.quality_score}>"
        )
