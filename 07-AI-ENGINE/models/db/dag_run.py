"""
app/models/db/dag_run.py
────────────────────────────────────────────────────────────────
Stores DAG execution records with full checkpoint state.
"""

from __future__ import annotations

from sqlalchemy import String, Text, Float, Integer, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class DAGRun(Base, TimestampMixin):
    __tablename__ = "dag_runs"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    goal:   Mapped[str] = mapped_column(Text, nullable=False)
    pattern: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status:  Mapped[str] = mapped_column(
        String(50), nullable=False, default="pending"
    )
    # pending | running | complete | partial | failed | cancelled

    # Execution summary
    total_nodes:      Mapped[int]   = mapped_column(Integer, default=0)
    completed_nodes:  Mapped[int]   = mapped_column(Integer, default=0)
    failed_nodes:     Mapped[int]   = mapped_column(Integer, default=0)
    total_duration_s: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Full graph definition (nodes + edges)
    graph_definition: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Checkpoint — current execution state for resume
    checkpoint_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Final assembled output
    final_output: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (
        Index("ix_dag_runs_status",     "status"),
        Index("ix_dag_runs_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<DAGRun id={self.id} "
            f"status={self.status!r} "
            f"nodes={self.total_nodes}>"
        )
