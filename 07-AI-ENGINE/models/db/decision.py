"""
app/models/db/decision.py
────────────────────────────────────────────────────────────────
Stores every decision made by the Decision Engine.
Append-only audit trail for all AI output evaluations.
"""

from __future__ import annotations

from sqlalchemy import String, Text, Float, Integer, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class DecisionRecord(Base, TimestampMixin):
    __tablename__ = "decision_records"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )

    # What was evaluated
    agent_name: Mapped[str] = mapped_column(String(100), nullable=False)
    task:       Mapped[str] = mapped_column(Text, nullable=False)
    model_used: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Decision outcome
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    verdict:    Mapped[str]   = mapped_column(String(20), nullable=False)
    # accept | review | retry | escalate

    risk_level: Mapped[str] = mapped_column(
        String(20), nullable=False, default="low"
    )
    # low | medium | high | critical

    # Detailed analysis
    risk_flags:   Mapped[list | None]  = mapped_column(JSON, nullable=True)
    alternatives: Mapped[list | None]  = mapped_column(JSON, nullable=True)
    reasoning:    Mapped[str | None]   = mapped_column(Text, nullable=True)

    # Output metadata
    output_length:    Mapped[int | None]   = mapped_column(Integer, nullable=True)
    duration_seconds: Mapped[float | None] = mapped_column(Float,   nullable=True)

    __table_args__ = (
        Index("ix_decision_records_agent_name", "agent_name"),
        Index("ix_decision_records_verdict",    "verdict"),
        Index("ix_decision_records_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<DecisionRecord id={self.id} "
            f"agent={self.agent_name!r} "
            f"verdict={self.verdict!r} "
            f"confidence={self.confidence}>"
        )
