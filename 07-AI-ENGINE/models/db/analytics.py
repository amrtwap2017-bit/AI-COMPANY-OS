"""
app/models/db/analytics.py
─────────────────────────────────────────────────────
PlatformEvent — append-only audit log.

Every agent call, workflow run, chat message, tool execution,
and knowledge search is recorded here. Never mutated.

NOTE: Column is named 'extra_data' not 'metadata'.
SQLAlchemy Declarative API reserves 'metadata' on Base.
"""

from sqlalchemy import String, Integer, Float, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class PlatformEvent(Base, TimestampMixin):
    __tablename__ = "platform_events"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )

    # What happened
    # agent_call | workflow_run | chat_message |
    # tool_execution | knowledge_search | project_run
    event_type: Mapped[str] = mapped_column(
        String(100), nullable=False
    )

    # Who was involved
    agent_name: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    model_used: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )

    # Outcome: success | failed | timeout | cancelled
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="success"
    )

    # Performance
    duration_seconds: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )

    # Size metrics
    input_chars: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    output_chars: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    # Arbitrary structured data — NOT named 'metadata' (reserved by SQLAlchemy)
    extra_data: Mapped[dict | None] = mapped_column(
        JSON, nullable=True, default=dict
    )

    __table_args__ = (
        Index("ix_platform_events_event_type", "event_type"),
        Index("ix_platform_events_agent_name", "agent_name"),
        Index("ix_platform_events_model_used", "model_used"),
        Index("ix_platform_events_status", "status"),
        Index("ix_platform_events_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<PlatformEvent id={self.id} "
            f"type={self.event_type!r} "
            f"agent={self.agent_name!r} "
            f"status={self.status!r}>"
        )
