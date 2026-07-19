"""
app/models/db/agent_message.py
────────────────────────────────────────────────────────────────
Agent-to-agent messaging protocol.

Agents can send structured messages to each other.
Messages sit in an inbox until the recipient processes them.

Message types:
  request    → agent asks another agent to do something
  response   → reply to a request
  broadcast  → send to all agents of a type
  alert      → urgent notification
  result     → share work output
"""

from __future__ import annotations

from sqlalchemy import String, Text, Integer, JSON, Index, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class AgentMessage(Base, TimestampMixin):
    __tablename__ = "agent_messages"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )

    # Routing
    from_agent:  Mapped[str] = mapped_column(String(100), nullable=False)
    to_agent:    Mapped[str] = mapped_column(String(100), nullable=False)
    # "all" = broadcast to all agents

    # Message type
    message_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="request"
    )
    # request | response | broadcast | alert | result

    # Content
    subject: Mapped[str]         = mapped_column(String(255), nullable=False)
    body:    Mapped[str]         = mapped_column(Text, nullable=False)
    payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # payload: structured data (e.g., task params, results)

    # Thread tracking
    thread_id:    Mapped[int | None] = mapped_column(Integer, nullable=True)
    reply_to_id:  Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Status
    read:       Mapped[bool] = mapped_column(Boolean, default=False)
    processed:  Mapped[bool] = mapped_column(Boolean, default=False)
    # read=True when recipient checks inbox
    # processed=True when action taken

    # Priority (1=urgent, 5=informational)
    priority: Mapped[int] = mapped_column(Integer, default=3)

    __table_args__ = (
        Index("ix_agent_messages_to",         "to_agent"),
        Index("ix_agent_messages_from",       "from_agent"),
        Index("ix_agent_messages_thread",     "thread_id"),
        Index("ix_agent_messages_unread",     "read"),
        Index("ix_agent_messages_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<AgentMessage id={self.id} "
            f"from={self.from_agent!r} "
            f"to={self.to_agent!r} "
            f"type={self.message_type!r}>"
        )
