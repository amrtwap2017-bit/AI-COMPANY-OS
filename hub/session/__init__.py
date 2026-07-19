"""
Hub Session Manager
===================
Manages active engineering sessions for Triangle Black workspaces.
"""
from __future__ import annotations
import importlib.util
import sys
import os
from pathlib import Path
from uuid import UUID

ROOT = Path("/home/amr/AI-COMPANY-OS")


def _load(rel: str):
    full = ROOT / rel
    key = rel.replace("/", ".").replace("-", "_").replace(".py", "")
    if key in sys.modules:
        return sys.modules[key]
    spec = importlib.util.spec_from_file_location(key, str(full))
    mod = importlib.util.module_from_spec(spec)
    sys.modules[key] = mod
    spec.loader.exec_module(mod)
    return mod


class HubSession:
    """
    Active engineering session for Triangle Black platform.
    Provides direct knowledge search, agent access, and memory.
    """

    def __init__(
        self,
        workspace_id: UUID,
        workspace_slug: str = "triangle-black",
    ):
        self.workspace_id    = workspace_id
        self.workspace_slug  = workspace_slug
        self._qdrant_host    = os.environ.get("QDRANT_HOST", "localhost")
        self._qdrant_port    = os.environ.get("QDRANT_PORT", "6333")
        self._ollama_url     = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
        self._collection     = f"{workspace_slug}_knowledge"

    async def _embed(self, text: str) -> list[float]:
        """Get embedding from Ollama nomic-embed-text."""
        import httpx
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{self._ollama_url}/api/embeddings",
                json={"model": "nomic-embed-text", "prompt": text[:2000]},
            )
            if resp.status_code == 200:
                return resp.json().get("embedding", [])
        return []

    async def ask_intelligence(
        self,
        query: str,
        limit: int = 5,
        score_threshold: float = 0.0,
    ) -> list[dict]:
        """
        Search Triangle Black knowledge base using semantic similarity.
        Uses direct Qdrant HTTP — bypasses WorkspaceVectorStore to avoid
        any filter or threshold bugs.
        """
        import httpx

        # Get embedding
        vec = await self._embed(query)
        if not vec:
            return []

        ws_id = str(self.workspace_id)

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                resp = await client.post(
                    f"http://{self._qdrant_host}:{self._qdrant_port}"
                    f"/collections/{self._collection}/points/search",
                    json={
                        "vector": vec,
                        "limit": limit,
                        "with_payload": True,
                        "score_threshold": score_threshold,
                        "filter": {
                            "must": [
                                {
                                    "key": "workspace_id",
                                    "match": {"value": ws_id},
                                }
                            ]
                        },
                    },
                )
                if resp.status_code == 200:
                    hits = resp.json().get("result", [])
                    return [
                        {
                            "id":      h.get("id"),
                            "score":   round(h.get("score", 0), 4),
                            "payload": h.get("payload", {}),
                        }
                        for h in hits
                    ]
            except Exception:
                pass

        return []

    async def get_context_for_task(self, task_description: str) -> dict:
        """Build a full context pack for a Triangle Black engineering task."""
        knowledge = await self.ask_intelligence(task_description, limit=8)
        return {
            "workspace_id":      str(self.workspace_id),
            "workspace_slug":    self.workspace_slug,
            "query":             task_description,
            "knowledge_snippets": knowledge,
            "knowledge_count":   len(knowledge),
        }

    async def index_workspace_knowledge(self) -> dict:
        """Index all Triangle Black brain documents into Qdrant."""
        brain_path = ROOT / "brains" / "triangle-black"

        vc  = _load("04-VECTOR/qdrant_client.py")
        ki  = _load("03-KNOWLEDGE/ingester.py")

        store = vc.WorkspaceVectorStore(self.workspace_id, self.workspace_slug)

        try:
            await store.ensure_collections()
        except Exception:
            pass

        ingester = ki.KnowledgeIngester(
            str(self.workspace_id),
            self.workspace_slug,
            store,
        )

        results = await ingester.ingest_directory(str(brain_path))
        return results

    async def search_raw(self, query: str, limit: int = 5) -> list[dict]:
        """
        Search without workspace filter — useful for cross-workspace queries.
        """
        import httpx

        vec = await self._embed(query)
        if not vec:
            return []

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                resp = await client.post(
                    f"http://{self._qdrant_host}:{self._qdrant_port}"
                    f"/collections/{self._collection}/points/search",
                    json={
                        "vector": vec,
                        "limit": limit,
                        "with_payload": True,
                        "score_threshold": 0.0,
                    },
                )
                if resp.status_code == 200:
                    return resp.json().get("result", [])
            except Exception:
                pass
        return []

    async def close(self):
        """No persistent connections to close in this implementation."""
        pass
