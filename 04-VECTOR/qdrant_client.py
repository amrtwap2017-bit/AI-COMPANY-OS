"""
Qdrant Vector Client
====================
Workspace-isolated vector operations.

Every collection is partitioned by workspace_id via payload filters.
No cross-workspace vector access is structurally possible.

Collection naming convention:
  {workspace_slug}_{memory_type}
  e.g. triangle-black_knowledge, triangle-black_execution

Embedding dimensions:
  nomic-embed-text: 768
  bge-m3:           1024
  text-embedding-3-small: 1536

All searches apply workspace_id filter FIRST before any semantic scoring.
"""

from __future__ import annotations

import os
from typing import Any
from uuid import UUID

import httpx
from qdrant_client import QdrantClient, AsyncQdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    SearchRequest,
    ScoredPoint,
    UpdateStatus,
)


# ─── Collection Configuration ─────────────────────────────────────────────────

COLLECTION_CONFIGS = {
    "knowledge": {
        "size": 768,           # nomic-embed-text
        "distance": Distance.COSINE,
        "description": "Document chunks, code, ADRs, requirements",
    },
    "memory": {
        "size": 768,
        "distance": Distance.COSINE,
        "description": "All memory types — filtered by memory_type payload",
    },
    "code": {
        "size": 768,
        "distance": Distance.COSINE,
        "description": "Source code embeddings for semantic search",
    },
}


class WorkspaceVectorStore:
    """
    Workspace-isolated Qdrant operations.

    Every method enforces workspace_id isolation via payload filters.
    The workspace_id is ALWAYS the first filter applied — never optional.

    Usage:
        store = WorkspaceVectorStore(workspace_id, workspace_slug)
        await store.ensure_collections()
        await store.upsert("knowledge", points)
        results = await store.search("knowledge", query_vector, limit=10)
    """

    def __init__(self, workspace_id: UUID, workspace_slug: str) -> None:
        self.workspace_id = str(workspace_id)
        self.workspace_slug = workspace_slug
        self._host = os.environ.get("QDRANT_HOST", "localhost")
        self._port = int(os.environ.get("QDRANT_PORT", "6333"))
        self._client: AsyncQdrantClient | None = None

    def _get_client(self) -> AsyncQdrantClient:
        if self._client is None:
            self._client = AsyncQdrantClient(
                host=self._host,
                port=self._port,
                timeout=30,
            )
        return self._client

    def _collection_name(self, collection_type: str) -> str:
        """Generate workspace-scoped collection name."""
        return f"{self.workspace_slug}_{collection_type}"

    def _workspace_filter(self) -> Filter:
        """
        Mandatory workspace isolation filter.
        Applied to EVERY search and scroll operation.
        """
        return Filter(
            must=[
                FieldCondition(
                    key="workspace_id",
                    match=MatchValue(value=self.workspace_id),
                )
            ]
        )

    async def ensure_collections(self) -> dict[str, bool]:
        """
        Create workspace vector collections if they do not exist.
        Called during workspace onboarding (INDEXING lifecycle state).
        Returns dict of {collection_type: created_or_existed}
        """
        client = self._get_client()
        results = {}

        for col_type, config in COLLECTION_CONFIGS.items():
            collection_name = self._collection_name(col_type)
            try:
                await client.get_collection(collection_name)
                results[col_type] = False  # already existed
            except Exception:
                await client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(
                        size=config["size"],
                        distance=config["distance"],
                    ),
                )
                results[col_type] = True  # created

        return results

    async def upsert(
        self,
        collection_type: str,
        points: list[dict[str, Any]],
    ) -> bool:
        """
        Insert or update vector points in a workspace collection.

        Each point must have:
            id: str (UUID)
            vector: list[float]
            payload: dict (must include workspace_id)

        The workspace_id is automatically injected into every payload.
        """
        client = self._get_client()
        collection_name = self._collection_name(collection_type)

        qdrant_points = []
        for p in points:
            payload = p.get("payload", {})
            payload["workspace_id"] = self.workspace_id  # enforce isolation
            payload["workspace_slug"] = self.workspace_slug

            qdrant_points.append(
                PointStruct(
                    id=p["id"],
                    vector=p["vector"],
                    payload=payload,
                )
            )

        result = await client.upsert(
            collection_name=collection_name,
            points=qdrant_points,
        )
        return result.status == UpdateStatus.COMPLETED

    async def search(
        self,
        collection_type: str,
        query_vector: list[float],
        limit: int = 10,
        additional_filter: dict | None = None,
        score_threshold: float = 0.0,
    ) -> list[dict[str, Any]]:
        """
        Semantic vector search within this workspace.

        The workspace_id filter is ALWAYS applied first.
        Additional filters can narrow results further (e.g. memory_type).

        Returns list of {id, score, payload} dicts.
        """
        client = self._get_client()
        collection_name = self._collection_name(collection_type)

        base_filter = self._workspace_filter()

        if additional_filter:
            for key, value in additional_filter.items():
                base_filter.must.append(
                    FieldCondition(key=key, match=MatchValue(value=value))
                )

        results = await client.search(
            collection_name=collection_name,
            query_vector=query_vector,
            query_filter=base_filter,
            limit=limit,
            score_threshold=score_threshold,
        )

        return [
            {
                "id": str(r.id),
                "score": r.score,
                "payload": r.payload or {},
            }
            for r in results
        ]

    async def delete_by_document(self, document_id: str) -> bool:
        """Delete all vectors associated with a document_id."""
        client = self._get_client()
        for col_type in COLLECTION_CONFIGS:
            try:
                await client.delete(
                    collection_name=self._collection_name(col_type),
                    points_selector=Filter(
                        must=[
                            FieldCondition(
                                key="workspace_id",
                                match=MatchValue(value=self.workspace_id),
                            ),
                            FieldCondition(
                                key="document_id",
                                match=MatchValue(value=document_id),
                            ),
                        ]
                    ),
                )
            except Exception:
                pass
        return True

    async def count(self, collection_type: str) -> int:
        """Count vectors in this workspace's collection."""
        client = self._get_client()
        try:
            result = await client.count(
                collection_name=self._collection_name(collection_type),
                count_filter=self._workspace_filter(),
            )
            return result.count
        except Exception:
            return 0

    async def close(self) -> None:
        if self._client:
            await self._client.close()
            self._client = None


async def get_embedding(text: str, model: str = "nomic-embed-text") -> list[float]:
    """
    Generate embedding via Ollama.
    Falls back to zero vector if Ollama unavailable.
    """
    ollama_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{ollama_url}/api/embeddings",
                json={"model": model, "prompt": text},
            )
            if response.status_code == 200:
                return response.json()["embedding"]
    except Exception:
        pass

    # Zero vector fallback — signals embedding failure
    return [0.0] * 768


async def get_embeddings_batch(
    texts: list[str],
    model: str = "nomic-embed-text",
) -> list[list[float]]:
    """Generate embeddings for multiple texts."""
    results = []
    for text in texts:
        embedding = await get_embedding(text, model)
        results.append(embedding)
    return results
