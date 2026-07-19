"""
app/memory/vector_store.py
────────────────────────────────────────────────────────────────
Qdrant operations for agent memory.

Separate from the "knowledge" collection.
Memory collection: "memory" — same 1024 dims as knowledge.

Each memory entry stored in Qdrant with payload:
  memory_id:   PostgreSQL row id
  agent_name:  which agent owns this memory
  content:     the memory text
  memory_type: short_term | long_term | semantic | episodic
  importance:  0.0–1.0 score

This allows:
  1. Semantic search across all memories
  2. Filter by agent_name in Qdrant payload
  3. Retrieve by similarity to any query
"""

from __future__ import annotations

import logging
import time

from vector.qdrant import vector_service
from knowledge.embedder import Embedder

log = logging.getLogger(__name__)

MEMORY_COLLECTION = "memory"
EMBED_DIMENSIONS = 768


class MemoryVectorStore:

    def __init__(self) -> None:
        self._embedder = Embedder()
        self._ready    = False

    def setup(self) -> None:
        """Ensure the Qdrant memory collection exists."""
        try:
            vector_service.ensure_collection(
                MEMORY_COLLECTION,
                size=EMBED_DIMENSIONS,
            )
            self._ready = True
            log.info("Memory vector store ready (collection=%r)", MEMORY_COLLECTION)
        except Exception as exc:
            log.error("Memory vector store setup failed: %s", exc)
            self._ready = False

    def _ensure_ready(self) -> bool:
        if not self._ready:
            self.setup()
        return self._ready

    def store(
        self,
        memory_id:   int,
        content:     str,
        agent_name:  str,
        memory_type: str,
        importance:  float,
    ) -> int | None:
        """
        Embed content and store in Qdrant.
        Returns the Qdrant point ID or None on failure.
        """
        if not self._ensure_ready():
            return None

        try:
            vector     = self._embedder.embed(content)
            # Use timestamp-based ID (same pattern as knowledge ingest)
            qdrant_id  = int(time.time() * 1000) + memory_id

            vector_service.upsert(
                collection=MEMORY_COLLECTION,
                id=qdrant_id,
                vector=vector,
                payload={
                    "memory_id":   memory_id,
                    "agent_name":  agent_name,
                    "content":     content[:500],
                    "memory_type": memory_type,
                    "importance":  importance,
                },
            )
            log.debug(
                "Memory %d stored in Qdrant (id=%d)", memory_id, qdrant_id
            )
            return qdrant_id

        except Exception as exc:
            log.error("Memory vector store failed for id=%d: %s", memory_id, exc)
            return None

    def search(
        self,
        query:      str,
        agent_name: str | None = None,
        top_k:      int        = 10,
        min_score:  float      = 0.3,
    ) -> list[dict]:
        """
        Semantic search across memory.
        Returns list of {memory_id, content, score, agent_name, importance}.
        """
        if not self._ensure_ready():
            return []

        try:
            vector  = self._embedder.embed(query)
            raw     = vector_service.search(
                collection=MEMORY_COLLECTION,
                vector=vector,
                top_k=top_k * 2,   # fetch extra, filter below
            )

            results = []
            for r in raw:
                if r["score"] < min_score:
                    continue
                payload = r["payload"]

                # Filter by agent if specified
                if agent_name and payload.get("agent_name") != agent_name:
                    continue

                results.append({
                    "memory_id":   payload.get("memory_id"),
                    "content":     payload.get("content", ""),
                    "agent_name":  payload.get("agent_name", ""),
                    "memory_type": payload.get("memory_type", ""),
                    "importance":  payload.get("importance", 0.5),
                    "score":       r["score"],
                })

            return results[:top_k]

        except Exception as exc:
            log.error("Memory vector search failed: %s", exc)
            return []

    def delete(self, qdrant_id: int) -> None:
        """Remove a point from Qdrant."""
        if not self._ensure_ready():
            return
        try:
            from qdrant_client.models import PointIdsList
            vector_service.client.delete(
                collection_name=MEMORY_COLLECTION,
                points_selector=PointIdsList(points=[qdrant_id]),
            )
        except Exception as exc:
            log.debug("Memory Qdrant delete failed: %s", exc)

    def collection_stats(self) -> dict:
        """Return stats about the memory Qdrant collection."""
        if not self._ensure_ready():
            return {"ready": False}
        try:
            info = vector_service.client.get_collection(MEMORY_COLLECTION)
            return {
                "ready":        True,
                "collection":   MEMORY_COLLECTION,
                "points_count": info.points_count,
                "dimensions":   EMBED_DIMENSIONS,
            }
        except Exception as exc:
            return {"ready": False, "error": str(exc)}


memory_vector_store = MemoryVectorStore()
