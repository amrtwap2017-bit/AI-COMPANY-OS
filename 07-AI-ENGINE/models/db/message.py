"""
app/models/db/message.py
─────────────────────────────────────────────────────
A single message within a conversation.

Columns match the actual database schema exactly.
"""

from sqlalchemy import String, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class Message(Base, TimestampMixin):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True
    )
    conversation_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(
        String(50), nullable=False
    )
    # user | assistant | system | tool
    content: Mapped[str] = mapped_column(
        Text, nullable=False
    )
    model_used: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    agent_name: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    tokens_used: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    def __repr__(self) -> str:
        return f"<Message id={self.id} role={self.role!r}>"
