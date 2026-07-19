"""
app/models/db/collaboration.py
────────────────────────────────────────────────────────────────
Stores collaboration run records.
Append-only. Never mutated after completion.
"""

from __future__ import annotations

from sqlalchemy import String, Text, Float, Integer, JSON, Index, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class CollaborationRun(Base, TimestampMixin):
    __tablename__ = "collaboration_runs"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )

    # What was requested
    goal: Mapped[str] = mapped_column(Text, nullable=False)

    # Execution state
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="pending"
    )
    # pending | running | complete | failed | partial

    # Which agents participated
    agents_used: Mapped[list | None] = mapped_column(
        JSON, nullable=True
    )
    # e.g. ["researcher", "writer", "evaluator"]

    # Individual agent results
    agent_outputs: Mapped[dict | None] = mapped_column(
        JSON, nullable=True
    )

    # Final assembled response
    final_response: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    # Performance
    total_duration_seconds: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    agents_succeeded: Mapped[int] = mapped_column(
        Integer, default=0
    )
    agents_failed: Mapped[int] = mapped_column(
        Integer, default=0
    )

    __table_args__ = (
        Index("ix_collaboration_runs_status", "status"),
        Index("ix_collaboration_runs_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<CollaborationRun id={self.id} "
            f"status={self.status!r}>"
        )
