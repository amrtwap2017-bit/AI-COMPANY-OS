"""
app/context/builder.py
────────────────────────────────────────────────────────────────
Assembles full context for every AI request.

Every agent call goes through this builder.
It pulls from all sources, ranks items, and returns
a structured context object ready for prompt assembly.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from sqlalchemy.orm import Session

from context.sources import (
    ContextItem,
    ConversationSource,
    MemorySource,
    SystemSource,
)
from context.ranker import ContextRanker


@dataclass
class AgentContext:
    """Full assembled context for one agent call."""
    agent_name:      str
    task:            str
    items:           list[ContextItem] = field(default_factory=list)
    conversation_id: int | None = None
    total_chars:     int = 0

    def by_source(self, source: str) -> list[ContextItem]:
        return [i for i in self.items if i.source == source]


class ContextBuilder:

    def __init__(
        self,
        db: Session,
        ranker: ContextRanker | None = None,
    ) -> None:
        self._db              = db
        self._ranker          = ranker or ContextRanker()
        self._conv_source     = ConversationSource(db)
        self._memory_source   = MemorySource(db)
        self._system_source   = SystemSource()

    def build(
        self,
        agent_name: str,
        task: str,
        conversation_id: int | None = None,
        memory_query: str | None = None,
        include_memory: bool = True,
        include_conversation: bool = True,
    ) -> AgentContext:
        """
        Assemble full context for an agent call.
        Returns ranked, trimmed AgentContext.
        """
        all_items: list[ContextItem] = []

        # 1. System context — always included, highest priority
        all_items.extend(
            self._system_source.fetch(agent_name, task)
        )

        # 2. Conversation history
        if include_conversation and conversation_id:
            all_items.extend(
                self._conv_source.fetch(conversation_id, limit=10)
            )

        # 3. Agent memory
        if include_memory:
            all_items.extend(
                self._memory_source.fetch(
                    agent_name,
                    query=memory_query or task,
                    limit=5,
                )
            )

        ranked = self._ranker.rank_and_trim(all_items)
        total  = sum(len(i.content) for i in ranked)

        return AgentContext(
            agent_name=agent_name,
            task=task,
            items=ranked,
            conversation_id=conversation_id,
            total_chars=total,
        )
