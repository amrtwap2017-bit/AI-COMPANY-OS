"""
app/repositories/memory.py
────────────────────────────────────────────────────────────────
Database operations for MemoryEntry.

Sprint 28 update:
  - save() now embeds content and stores in Qdrant
  - delete() removes from both PostgreSQL and Qdrant
  - search_by_vector() added for semantic search
  - search_by_content() (ILIKE) kept as fallback

Deduplication: same content per agent is never saved twice.
"""

from __future__ import annotations

import logging
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from models.db.memory_entry import MemoryEntry

log = logging.getLogger(__name__)


class MemoryRepository:

    def __init__(self, db: Session) -> None:
        self._db = db

    def save(self, entry: MemoryEntry) -> MemoryEntry:
        """
        Save a memory entry to PostgreSQL.
        Also embeds and stores in Qdrant for semantic search.
        Deduplicates by content per agent.
        """
        # Deduplication check
        if self._is_duplicate(entry.agent_name, entry.content):
            existing = self._find_by_content(entry.agent_name, entry.content)
            if existing:
                return existing

        self._db.add(entry)
        self._db.commit()
        self._db.refresh(entry)

        # Store in Qdrant (non-blocking — failure does not break save)
        self._store_vector(entry)

        return entry

    def _store_vector(self, entry: MemoryEntry) -> None:
        """Embed and store in Qdrant. Updates qdrant_id on the DB record."""
        try:
            from memory.vector_store import memory_vector_store
            qdrant_id = memory_vector_store.store(
                memory_id=entry.id,
                content=entry.content,
                agent_name=entry.agent_name or "unknown",
                memory_type=entry.memory_type,
                importance=entry.importance,
            )
            if qdrant_id:
                entry.qdrant_id = qdrant_id
                entry.vector_id = str(qdrant_id)
                self._db.commit()
        except Exception as exc:
            log.debug("Memory vector store failed (non-fatal): %s", exc)

    def search_by_vector(
        self,
        query:      str,
        agent_name: str | None = None,
        limit:      int        = 10,
        min_score:  float      = 0.3,
    ) -> list[MemoryEntry]:
        """
        Semantic search using Qdrant vector similarity.
        Falls back to ILIKE if Qdrant unavailable.
        Returns MemoryEntry objects fetched from PostgreSQL by ID.
        """
        try:
            from memory.vector_store import memory_vector_store
            vector_results = memory_vector_store.search(
                query=query,
                agent_name=agent_name,
                top_k=limit,
                min_score=min_score,
            )

            if not vector_results:
                return self.search_by_content(query, agent_name, limit)

            # Fetch full MemoryEntry objects from PostgreSQL by ID
            memory_ids = [
                r["memory_id"]
                for r in vector_results
                if r.get("memory_id")
            ]

            entries: list[MemoryEntry] = []
            for mid in memory_ids:
                entry = self.get_by_id(mid)
                if entry:
                    entries.append(entry)

            return entries

        except Exception as exc:
            log.warning("Vector search failed, falling back to ILIKE: %s", exc)
            return self.search_by_content(query, agent_name, limit)

    def _is_duplicate(
        self,
        agent_name: str | None,
        content: str,
    ) -> bool:
        return self._find_by_content(agent_name, content) is not None

    def _find_by_content(
        self,
        agent_name: str | None,
        content: str,
    ) -> MemoryEntry | None:
        normalised = content.strip().lower()
        q = self._db.query(MemoryEntry)
        if agent_name:
            q = q.filter(MemoryEntry.agent_name == agent_name)
        for e in q.all():
            if e.content.strip().lower() == normalised:
                return e
        return None

    def get_by_id(self, memory_id: int) -> MemoryEntry | None:
        return self._db.query(MemoryEntry).filter(
            MemoryEntry.id == memory_id
        ).first()

    def get_by_agent(
        self,
        agent_name:  str,
        memory_type: str | None = None,
        limit:       int        = 20,
        user_id:     int | None = None,
    ) -> list[MemoryEntry]:
        q = self._db.query(MemoryEntry).filter(
            MemoryEntry.agent_name == agent_name
        )
        if memory_type:
            q = q.filter(MemoryEntry.memory_type == memory_type)
        return (
            q.order_by(desc(MemoryEntry.importance))
            .limit(limit)
            .all()
        )

    def get_recent(
        self,
        agent_name: str,
        limit:      int = 10,
    ) -> list[MemoryEntry]:
        return (
            self._db.query(MemoryEntry)
            .filter(MemoryEntry.agent_name == agent_name)
            .order_by(desc(MemoryEntry.created_at))
            .limit(limit)
            .all()
        )

    def search_by_content(
        self,
        query:      str,
        agent_name: str | None = None,
        limit:      int        = 10,
    ) -> list[MemoryEntry]:
        """ILIKE fallback search. Used when Qdrant unavailable."""
        q = self._db.query(MemoryEntry).filter(
            MemoryEntry.content.ilike(f"%{query}%")
        )
        if agent_name:
            q = q.filter(MemoryEntry.agent_name == agent_name)
        return (
            q.order_by(desc(MemoryEntry.importance))
            .limit(limit)
            .all()
        )

    def delete(self, memory_id: int) -> bool:
        entry = self.get_by_id(memory_id)
        if not entry:
            return False

        # Remove from Qdrant first
        if entry.qdrant_id:
            try:
                from memory.vector_store import memory_vector_store
                memory_vector_store.delete(entry.qdrant_id)
            except Exception as exc:
                log.debug("Qdrant delete failed (non-fatal): %s", exc)

        self._db.delete(entry)
        self._db.commit()
        return True

    def count_by_agent(self, agent_name: str) -> int:
        return (
            self._db.query(func.count(MemoryEntry.id))
            .filter(MemoryEntry.agent_name == agent_name)
            .scalar() or 0
        )

    def get_low_importance(
        self,
        agent_name: str,
        threshold:  float = 0.2,
        limit:      int   = 50,
    ) -> list[MemoryEntry]:
        return (
            self._db.query(MemoryEntry)
            .filter(
                MemoryEntry.agent_name == agent_name,
                MemoryEntry.importance < threshold,
            )
            .order_by(MemoryEntry.importance)
            .limit(limit)
            .all()
        )

    def promote_to_long_term(self, memory_id: int) -> bool:
        entry = self.get_by_id(memory_id)
        if not entry:
            return False
        entry.memory_type = "long_term"
        self._db.commit()
        return True
