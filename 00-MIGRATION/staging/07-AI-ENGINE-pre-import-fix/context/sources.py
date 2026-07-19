"""
app/context/sources.py
────────────────────────────────────────────────────────────────
Individual context sources.

Each source is responsible for fetching one type of context.
All sources return a list of ContextItem.
The builder combines them all.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from sqlalchemy.orm import Session

from app.repositories.memory import MemoryRepository
from app.repositories.conversation import ConversationRepository


@dataclass
class ContextItem:
    """A single piece of context with source and weight."""
    source: str
    content: str
    weight: float = 1.0
    extra: dict = field(default_factory=dict)


class ConversationSource:
    """Fetches recent conversation messages."""

    def __init__(self, db: Session) -> None:
        self._repo = ConversationRepository(db)

    def fetch(
        self,
        conversation_id: int,
        limit: int = 10,
    ) -> list[ContextItem]:
        messages = self._repo.get_messages(conversation_id, limit)
        return [
            ContextItem(
                source="conversation",
                content=f"{m.role}: {m.content}",
                weight=1.0,
            )
            for m in messages
        ]


class MemorySource:
    """Fetches relevant agent memories."""

    def __init__(self, db: Session) -> None:
        self._repo = MemoryRepository(db)

    def fetch(
        self,
        agent_name: str,
        query: str | None = None,
        limit: int = 5,
    ) -> list[ContextItem]:
        if query:
            # Use semantic vector search (Sprint 28)
            entries = self._repo.search_by_vector(
                query=query,
                agent_name=agent_name,
                limit=limit,
                min_score=0.25,
            )
            # Fallback to ILIKE if no vector results
            if not entries:
                entries = self._repo.search_by_content(
                    query, agent_name, limit
                )
        else:
            entries = self._repo.get_by_agent(
                agent_name, limit=limit
            )
        return [
            ContextItem(
                source="memory",
                content=e.content,
                weight=e.importance,
                extra={"memory_type": e.memory_type},
            )
            for e in entries
        ]


class SystemSource:
    """Provides static system-level context."""

    def fetch(
        self,
        agent_name: str,
        task: str,
    ) -> list[ContextItem]:
        return [
            ContextItem(
                source="system",
                content=(
                    f"You are {agent_name}, an AI agent in the "
                    f"AI Company OS platform.\n"
                    f"Current task: {task}"
                ),
                weight=2.0,
            )
        ]
