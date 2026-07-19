"""
app/models/db/agent_run.py
─────────────────────────────────────────────────────
Records every individual agent execution.

Column names match the actual database schema:
  user_input (not input_text)
  output     (not output_text)
  error      (present in DB)
"""

from sqlalchemy import String, Text, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class AgentRun(Base, TimestampMixin):
    __tablename__ = "agent_runs"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    agent_name: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )
    model_used: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    user_input: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    output: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(50), default="success"
    )
    error: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    duration_seconds: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    conversation_id: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    def __repr__(self) -> str:
        return f"<AgentRun id={self.id} agent={self.agent_name!r}>"
