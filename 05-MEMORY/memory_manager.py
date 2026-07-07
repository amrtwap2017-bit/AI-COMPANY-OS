"""
Memory Manager
==============
Multi-tier memory system for the AI Company OS platform.

Memory Types and Retention:
  conversation  — session-scoped, expires 24h
  project       — project-scoped, permanent
  architecture  — workspace-scoped, permanent, versioned
  execution     — run-scoped, 30 day retention
  failure       — permanent (prevents repeat mistakes)
  learning      — permanent (distilled from failures + successes)

Every execution writes to memory regardless of outcome.
Failures are distilled into permanent learning entries.

Storage:
  Relational: memories table (searchable by type, workspace, project)
  Vector:     memory Qdrant collection (semantic similarity search)
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker


# ─── Memory Type Configuration ────────────────────────────────────────────────

MEMORY_TYPE_CONFIG = {
    "conversation": {
        "retention_hours": 24,
        "permanent": False,
        "description": "Session-level conversation context",
    },
    "project": {
        "retention_hours": None,
        "permanent": True,
        "description": "Project-level decisions and context",
    },
    "architecture": {
        "retention_hours": None,
        "permanent": True,
        "description": "Architecture decisions (ADRs)",
    },
    "execution": {
        "retention_hours": 720,  # 30 days
        "permanent": False,
        "description": "Run execution logs and outputs",
    },
    "failure": {
        "retention_hours": None,
        "permanent": True,
        "description": "Failure patterns to avoid repeating",
    },
    "learning": {
        "retention_hours": None,
        "permanent": True,
        "description": "Distilled knowledge from execution history",
    },
}


def _get_db_session():
    url = os.environ.get("DATABASE_URL", "postgresql+asyncpg://ai:ai123@localhost:5432/ai_company_os")
    engine = create_async_engine(url, echo=False)
    return async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


class MemoryManager:
    """
    Manages all memory types for a workspace.

    Every agent invocation reads relevant memories via semantic search.
    Every execution writes memories via store_memory().
    Failures are automatically elevated to permanent failure memories.
    """

    def __init__(
        self,
        workspace_id: UUID,
        workspace_slug: str,
        vector_store=None,
    ) -> None:
        self.workspace_id = workspace_id
        self.workspace_slug = workspace_slug
        self.vector_store = vector_store
        self._session_factory = _get_db_session()

    async def store_memory(
        self,
        content: str,
        memory_type: str,
        project_id: UUID | None = None,
        tags: list[str] | None = None,
        run_group: UUID | None = None,
    ) -> dict[str, Any]:
        """
        Store a new memory entry.

        Automatically sets expiry based on memory_type retention policy.
        Also embeds content in vector store for semantic retrieval.

        Args:
            content:     The memory content to store
            memory_type: One of the 6 memory types
            project_id:  Optional project scope
            tags:        Searchable tags
            run_group:   Execution correlation ID

        Returns:
            {"memory_id": UUID, "memory_type": str, "expires_at": datetime|None}
        """
        if memory_type not in MEMORY_TYPE_CONFIG:
            raise ValueError(f"Invalid memory_type: {memory_type}. "
                           f"Valid: {list(MEMORY_TYPE_CONFIG.keys())}")

        config = MEMORY_TYPE_CONFIG[memory_type]
        expires_at = None
        if config["retention_hours"]:
            expires_at = datetime.now(timezone.utc) + timedelta(hours=config["retention_hours"])

        memory_id = str(uuid4())

        async with self._session_factory() as session:
            await session.execute(
                text("""
                    INSERT INTO memories (id, workspace_id, project_id, memory_type, content, expires_at)
                    VALUES (:mid, :wid, :pid, :mtype, :content, :expires)
                """),
                {
                    "mid": memory_id,
                    "wid": str(self.workspace_id),
                    "pid": str(project_id) if project_id else None,
                    "mtype": memory_type,
                    "content": content,
                    "expires": expires_at,
                },
            )

            if tags:
                for tag in tags:
                    await session.execute(
                        text("INSERT INTO memory_tags (memory_id, tag) VALUES (:mid, :tag)"),
                        {"mid": memory_id, "tag": tag},
                    )

            await session.commit()

        # Also embed in vector store for semantic search
        if self.vector_store:
            try:
                from ..04_VECTOR.qdrant_client import get_embedding
                embedding = await get_embedding(content)
                await self.vector_store.upsert(
                    "memory",
                    [{
                        "id": memory_id,
                        "vector": embedding,
                        "payload": {
                            "memory_type": memory_type,
                            "content": content,
                            "project_id": str(project_id) if project_id else None,
                            "run_group": str(run_group) if run_group else None,
                            "tags": tags or [],
                            "expires_at": expires_at.isoformat() if expires_at else None,
                        },
                    }]
                )
            except Exception:
                pass  # Vector storage failure does not block relational storage

        return {
            "memory_id": memory_id,
            "memory_type": memory_type,
            "expires_at": expires_at,
            "workspace_id": str(self.workspace_id),
        }

    async def search_memories(
        self,
        query: str,
        memory_types: list[str] | None = None,
        limit: int = 10,
        project_id: UUID | None = None,
    ) -> list[dict[str, Any]]:
        """
        Search memories using semantic similarity.

        Searches vector store first, then falls back to SQL keyword search.
        Always filters by workspace_id.

        Args:
            query:        Natural language search query
            memory_types: Filter to specific types (None = all types)
            limit:        Maximum results to return
            project_id:   Optional project scope filter

        Returns:
            List of matching memory records with relevance scores
        """
        results = []

        # Try vector search first
        if self.vector_store:
            try:
                from ..04_VECTOR.qdrant_client import get_embedding
                query_vector = await get_embedding(query)

                additional_filter = {}
                if memory_types and len(memory_types) == 1:
                    additional_filter["memory_type"] = memory_types[0]

                vector_results = await self.vector_store.search(
                    "memory",
                    query_vector,
                    limit=limit,
                    additional_filter=additional_filter if additional_filter else None,
                    score_threshold=0.5,
                )

                for r in vector_results:
                    payload = r["payload"]
                    if memory_types and payload.get("memory_type") not in memory_types:
                        continue
                    results.append({
                        "memory_id": r["id"],
                        "content": payload.get("content", ""),
                        "memory_type": payload.get("memory_type"),
                        "score": r["score"],
                        "source": "vector",
                    })

                if results:
                    return results[:limit]
            except Exception:
                pass

        # SQL fallback
        async with self._session_factory() as session:
            sql = """
                SELECT id, memory_type, content, project_id, created_at
                FROM memories
                WHERE workspace_id = :wid
                  AND (expires_at IS NULL OR expires_at > NOW())
                  AND content ILIKE :query
            """
            params: dict[str, Any] = {
                "wid": str(self.workspace_id),
                "query": f"%{query}%",
            }

            if memory_types:
                sql += " AND memory_type = ANY(:types)"
                params["types"] = memory_types

            if project_id:
                sql += " AND project_id = :pid"
                params["pid"] = str(project_id)

            sql += " ORDER BY created_at DESC LIMIT :limit"
            params["limit"] = limit

            result = await session.execute(text(sql), params)
            for row in result.fetchall():
                results.append({
                    "memory_id": str(row.id),
                    "content": row.content,
                    "memory_type": row.memory_type,
                    "score": 0.5,
                    "source": "sql",
                })

        return results[:limit]

    async def get_context_memories(
        self,
        task_description: str,
        project_id: UUID | None = None,
        limit: int = 5,
    ) -> dict[str, list[dict]]:
        """
        Retrieve the most relevant memories for a task context pack.

        Returns memories organized by type for easy context assembly:
        {
            "failures": [...],     ← what went wrong before
            "learnings": [...],    ← what to do differently
            "architecture": [...], ← relevant design decisions
            "project": [...],      ← project-specific context
        }
        """
        context = {
            "failures": [],
            "learnings": [],
            "architecture": [],
            "project": [],
        }

        failure_memories = await self.search_memories(
            task_description,
            memory_types=["failure"],
            limit=limit,
            project_id=project_id,
        )
        context["failures"] = failure_memories

        learning_memories = await self.search_memories(
            task_description,
            memory_types=["learning"],
            limit=limit,
            project_id=project_id,
        )
        context["learnings"] = learning_memories

        arch_memories = await self.search_memories(
            task_description,
            memory_types=["architecture"],
            limit=limit,
        )
        context["architecture"] = arch_memories

        if project_id:
            proj_memories = await self.search_memories(
                task_description,
                memory_types=["project"],
                limit=limit,
                project_id=project_id,
            )
            context["project"] = proj_memories

        return context

    async def store_execution_result(
        self,
        run_group: UUID,
        task_title: str,
        outcome: str,
        details: str,
        project_id: UUID | None = None,
    ) -> dict[str, Any]:
        """
        Store execution result — always called after any agent run.

        If outcome is "failure", also creates a permanent failure memory.
        If outcome is "success", creates an execution memory (30d retention).
        """
        execution_content = (
            f"Task: {task_title}\n"
            f"Outcome: {outcome}\n"
            f"Run Group: {run_group}\n"
            f"Details: {details[:500]}"
        )

        exec_memory = await self.store_memory(
            content=execution_content,
            memory_type="execution",
            project_id=project_id,
            tags=["execution", outcome, str(run_group)[:8]],
            run_group=run_group,
        )

        if outcome == "failure":
            failure_content = (
                f"FAILURE PATTERN — Task: {task_title}\n"
                f"What failed: {details[:800]}\n"
                f"Run Group: {run_group}"
            )
            await self.store_memory(
                content=failure_content,
                memory_type="failure",
                project_id=project_id,
                tags=["failure", task_title[:30]],
                run_group=run_group,
            )

        return exec_memory

    async def get_memory_stats(self) -> dict[str, Any]:
        """Return memory statistics for the workspace dashboard."""
        async with self._session_factory() as session:
            result = await session.execute(
                text("""
                    SELECT memory_type, COUNT(*) as count
                    FROM memories
                    WHERE workspace_id = :wid
                      AND (expires_at IS NULL OR expires_at > NOW())
                    GROUP BY memory_type
                """),
                {"wid": str(self.workspace_id)},
            )
            by_type = {row.memory_type: row.count for row in result.fetchall()}

            total_result = await session.execute(
                text("SELECT COUNT(*) FROM memories WHERE workspace_id = :wid"),
                {"wid": str(self.workspace_id)},
            )
            total = total_result.scalar_one()

        return {
            "workspace_id": str(self.workspace_id),
            "total_memories": total,
            "by_type": by_type,
            "permanent_count": sum(
                v for k, v in by_type.items()
                if MEMORY_TYPE_CONFIG.get(k, {}).get("permanent", False)
            ),
        }
