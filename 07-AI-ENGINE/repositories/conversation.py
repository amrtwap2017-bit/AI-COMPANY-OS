"""
app/repositories/conversation.py
────────────────────────────────────────────────────────────────
Database operations for Conversation and Message.
Matches the actual DB schema exactly.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from models.db.conversation import Conversation
from models.db.message import Message


class ConversationRepository:

    def __init__(self, db: Session) -> None:
        self._db = db

    def create(
        self,
        agent_name: str,
        title: str | None = None,
        user_id: int | None = None,
        status: str = "active",
    ) -> Conversation:
        conv = Conversation(
            agent_name=agent_name,
            title=title,
            user_id=user_id,
            status=status,
            message_count=0,
        )
        self._db.add(conv)
        self._db.commit()
        self._db.refresh(conv)
        return conv

    def get(self, conv_id: int) -> Conversation | None:
        """Alias for get_by_id — used by ChatService."""
        return self.get_by_id(conv_id)

    def get_by_id(self, conv_id: int) -> Conversation | None:
        return self._db.query(Conversation).filter(
            Conversation.id == conv_id
        ).first()

    def add_message(
        self,
        conversation_id: int,
        role: str,
        content: str,
        agent_name: str | None = None,
        model_used: str | None = None,
    ) -> Message:
        """
        Add a message to a conversation.
        Increments conversation message_count.
        """
        msg = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            agent_name=agent_name,
            model_used=model_used,
        )
        self._db.add(msg)

        # Increment message count on conversation
        conv = self.get_by_id(conversation_id)
        if conv:
            conv.message_count = (conv.message_count or 0) + 1

        self._db.commit()
        self._db.refresh(msg)
        return msg

    def get_messages(
        self,
        conversation_id: int,
        limit: int = 20,
    ) -> list[Message]:
        return (
            self._db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
            .all()
        )[::-1]

    def list_all(
        self,
        limit: int = 20,
    ) -> list[Conversation]:
        return (
            self._db.query(Conversation)
            .order_by(Conversation.created_at.desc())
            .limit(limit)
            .all()
        )

    def list_by_agent(
        self,
        agent_name: str,
        limit: int = 10,
    ) -> list[Conversation]:
        return (
            self._db.query(Conversation)
            .filter(Conversation.agent_name == agent_name)
            .order_by(Conversation.created_at.desc())
            .limit(limit)
            .all()
        )
