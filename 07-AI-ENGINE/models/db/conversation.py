"""
app/models/db/conversation.py
─────────────────────────────────────────────────────
A conversation session between a user and an agent.

Columns match the actual database schema exactly.
"""

from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class Conversation(Base, TimestampMixin):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True
    )
    title: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )
    agent_name: Mapped[str] = mapped_column(
        String(100), nullable=False, default="orchestrator"
    )
    status: Mapped[str] = mapped_column(
        String(50), default="active"
    )
    message_count: Mapped[int] = mapped_column(
        Integer, default=0
    )
    user_id: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    def __repr__(self) -> str:
        return f"<Conversation id={self.id} agent={self.agent_name!r}>"
