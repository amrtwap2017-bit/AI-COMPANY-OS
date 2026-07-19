"""
app/memory/service.py
────────────────────────────────────────────────────────────────
Core memory API. The only entry point for the rest of the system.

All memory operations go through this service.
Repository, ranker, compressor, promoter are injected.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from sqlalchemy.orm import Session

from models.db.memory_entry import MemoryEntry
from repositories.memory import MemoryRepository
from memory.ranker import MemoryRanker
from memory.compressor import MemoryCompressor
from memory.promoter import MemoryPromoter

log = logging.getLogger(__name__)


@dataclass
class MemorySaveRequest:
    agent_name: str
    content: str
    memory_type: str = "short_term"
    importance: float | None = None
    extra_data: dict | None = None


class MemoryService:

    def __init__(
        self,
        db: Session,
        ranker: MemoryRanker | None = None,
        compressor: MemoryCompressor | None = None,
        promoter: MemoryPromoter | None = None,
    ) -> None:
        self._repo      = MemoryRepository(db)
        self._ranker    = ranker or MemoryRanker()
        self._compressor = compressor or MemoryCompressor()
        self._promoter  = promoter or MemoryPromoter()

    def save(self, request: MemorySaveRequest) -> MemoryEntry:
        """Save a memory. Score it. Promote if warranted."""
        entry = MemoryEntry(
            agent_name=request.agent_name,
            memory_type=request.memory_type,
            content=request.content,
            importance=request.importance or 0.5,
            extra_data=request.extra_data or {},
        )

        if request.importance is None:
            entry.importance = self._ranker.score(entry)

        saved = self._repo.save(entry)
        self._maybe_promote(saved)
        self._maybe_compress(request.agent_name)
        return saved

    def get_context_memories(
        self,
        agent_name: str,
        limit: int = 10,
    ) -> list[MemoryEntry]:
        """
        Return the most important memories for building context.
        Mix of recent and high-importance entries.
        """
        by_importance = self._repo.get_by_agent(
            agent_name, limit=limit
        )
        by_recency = self._repo.get_recent(
            agent_name, limit=limit // 2
        )

        seen_ids: set[int] = set()
        combined: list[MemoryEntry] = []
        for entry in by_importance + by_recency:
            if entry.id not in seen_ids:
                seen_ids.add(entry.id)
                combined.append(entry)

        scored = self._ranker.score_all(combined)
        return [entry for entry, _ in scored[:limit]]

    def search(
        self,
        query:      str,
        agent_name: str | None = None,
        limit:      int        = 10,
        semantic:   bool       = True,
    ) -> list[MemoryEntry]:
        """
        Search memories.
        semantic=True  → Qdrant vector similarity (default)
        semantic=False → ILIKE text matching (fallback)
        """
        if semantic:
            return self._repo.search_by_vector(
                query=query,
                agent_name=agent_name,
                limit=limit,
            )
        return self._repo.search_by_content(query, agent_name, limit)

    def search_semantic(
        self,
        query:      str,
        agent_name: str | None = None,
        limit:      int        = 10,
        min_score:  float      = 0.25,
    ) -> list[MemoryEntry]:
        """Explicit semantic search with score threshold control."""
        return self._repo.search_by_vector(
            query=query,
            agent_name=agent_name,
            limit=limit,
            min_score=min_score,
        )

    def get_by_agent(
        self,
        agent_name: str,
        memory_type: str | None = None,
        limit: int = 20,
    ) -> list[MemoryEntry]:
        return self._repo.get_by_agent(agent_name, memory_type, limit)

    def delete(self, memory_id: int) -> bool:
        return self._repo.delete(memory_id)

    def count(self, agent_name: str) -> int:
        return self._repo.count_by_agent(agent_name)

    def _maybe_promote(self, entry: MemoryEntry) -> None:
        score = self._ranker.score(entry)
        if self._promoter.should_promote(entry, score):
            self._repo.promote_to_long_term(entry.id)
            log.debug("Memory %d promoted to long_term", entry.id)

    def _maybe_compress(self, agent_name: str) -> None:
        all_entries = self._repo.get_by_agent(agent_name, limit=100)
        if not self._compressor.should_compress(all_entries):
            return
        to_compress = self._compressor.select_for_compression(
            all_entries
        )
        if not to_compress:
            return
        compressed = self._compressor.build_compressed_entry(
            to_compress, agent_name
        )
        for old in to_compress:
            self._repo.delete(old.id)
        self._repo.save(compressed)
        log.debug(
            "Compressed %d memories for agent %s",
            len(to_compress), agent_name,
        )


# ── Module-level singleton for legacy imports ─────────────────
# Provides: from memory.service import memory_service
# New code should use dependency injection instead.

from db.database import SessionLocal as _SessionLocal

def _make_memory_service() -> "MemoryService":
    db = _SessionLocal()
    return MemoryService(db)

memory_service = _make_memory_service()
