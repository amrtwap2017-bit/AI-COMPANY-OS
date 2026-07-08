"""
Context Pack Builder — Wave 3 Production
==========================================
Assembles complete execution context before every agent invocation.

CRITICAL ADDITION: Searches Triangle Black knowledge base in Qdrant
before returning context. This means every agent invocation is
enriched with relevant business specifications, domain rules,
and engineering standards from 1,498 indexed documents.

Context pack structure:
  task          — full task with acceptance criteria
  workspace     — workspace config, paths, model route
  project       — roadmap and metadata
  memories      — failures, learnings, architecture decisions
  knowledge     — TOP-10 relevant docs from Qdrant
  sibling_tasks — other tasks in same epic
  model_route   — which model to use
"""

from __future__ import annotations

import os
from typing import Any
from uuid import UUID

import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)


def _get_factory():
    url = os.environ.get(
        "DATABASE_URL",
        "postgresql+asyncpg://ai:ai123@localhost:5432/ai_company_os",
    )
    engine = create_async_engine(url, echo=False)
    return async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )


# ── Model routing ──────────────────────────────────────────────────────────────

_LOCAL_ROUTES = {
    "coding":        {"model_id": "llama3.2:3b",     "provider": "ollama", "endpoint": "http://localhost:11434", "context_window": 128000},
    "architecture":  {"model_id": "llama3.2:3b",     "provider": "ollama", "endpoint": "http://localhost:11434", "context_window": 128000},
    "testing":       {"model_id": "llama3.2:3b",     "provider": "ollama", "endpoint": "http://localhost:11434", "context_window": 128000},
    "fast_review":   {"model_id": "llama3.2:3b",     "provider": "ollama", "endpoint": "http://localhost:11434", "context_window": 128000},
    "security_scan": {"model_id": "llama3.2:3b",     "provider": "ollama", "endpoint": "http://localhost:11434", "context_window": 128000},
    "documentation": {"model_id": "llama3.2:3b",     "provider": "ollama", "endpoint": "http://localhost:11434", "context_window": 128000},
    "embedding":     {"model_id": "nomic-embed-text", "provider": "ollama", "endpoint": "http://localhost:11434", "context_window": 8192},
}


async def _get_model_route(task_type: str, workspace_id: UUID) -> dict[str, Any]:
    route = _LOCAL_ROUTES.get(task_type, _LOCAL_ROUTES["coding"])
    route["is_local"] = True
    route["estimated_cost_per_1k_tokens"] = 0.0
    return route


# ── Qdrant knowledge search ────────────────────────────────────────────────────

async def _search_workspace_knowledge(
    query: str,
    workspace_slug: str,
    limit: int = 8,
) -> list[dict[str, Any]]:
    """
    Search the workspace knowledge base in Qdrant.
    Returns top-N relevant document chunks for the query.
    Tried collections in order:
      1. {workspace_slug}_knowledge  (workspace-specific)
      2. knowledge                   (global fallback)
    """
    qdrant_host = os.environ.get("QDRANT_HOST", "localhost")
    qdrant_port = os.environ.get("QDRANT_PORT", "6333")
    ollama_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")

    # Step 1: Embed the query
    query_vector = None
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{ollama_url}/api/embeddings",
                json={"model": "nomic-embed-text", "prompt": query[:2000]},
            )
            if resp.status_code == 200:
                query_vector = resp.json().get("embedding")
    except Exception:
        pass

    if not query_vector:
        return []

    # Step 2: Search Qdrant — try workspace collection first
    collections_to_try = [
        f"{workspace_slug}_knowledge",
        "knowledge",
    ]

    results = []
    async with httpx.AsyncClient(timeout=10.0) as client:
        for collection in collections_to_try:
            try:
                resp = await client.post(
                    f"http://{qdrant_host}:{qdrant_port}/collections/{collection}/points/search",
                    json={
                        "vector": query_vector,
                        "limit": limit,
                        "with_payload": True,
                        "score_threshold": 0.1,
                    },
                )
                if resp.status_code == 200:
                    hits = resp.json().get("result", [])
                    for hit in hits:
                        payload = hit.get("payload", {})
                        results.append({
                            "score": round(hit.get("score", 0), 4),
                            "file_path": payload.get("file_path", ""),
                            "section": payload.get("section", ""),
                            "content": payload.get("content", "")[:600],
                            "collection": collection,
                        })
                    if results:
                        break  # Found results — stop trying
            except Exception:
                continue

    return results[:limit]


# ── Main context pack builder ──────────────────────────────────────────────────

async def build_context_pack(
    task_id: UUID,
    workspace_id: UUID,
    project_id: UUID,
) -> dict[str, Any]:
    """
    Assemble the complete context pack for a task execution.

    This is the single most important function in the execution pipeline.
    Every agent invocation starts here.

    Steps:
    1. Load task from database
    2. Load workspace config
    3. Load project metadata
    4. Load relevant memories (failures, learnings, architecture)
    5. Search Qdrant for relevant knowledge (NEW — connects business specs)
    6. Load sibling tasks from same epic
    7. Determine model route
    8. Return complete context pack
    """
    factory = _get_factory()

    async with factory() as session:

        # ── Task ──────────────────────────────────────────────────────────────
        task_result = await session.execute(
            text("""
                SELECT id, title, description, task_type,
                       acceptance_criteria, assigned_agent,
                       model_hint, status, retry_count,
                       max_retries, run_group, parent_id
                FROM tasks
                WHERE id = :tid AND workspace_id = :wid
            """),
            {"tid": str(task_id), "wid": str(workspace_id)},
        )
        task_row = task_result.fetchone()
        if not task_row:
            return {"error": f"Task {task_id} not found in workspace {workspace_id}"}

        # ── Workspace ─────────────────────────────────────────────────────────
        ws_result = await session.execute(
            text("SELECT id, name, slug, lifecycle_state FROM workspaces WHERE id = :wid"),
            {"wid": str(workspace_id)},
        )
        ws_row = ws_result.fetchone()

        # ── Project ───────────────────────────────────────────────────────────
        proj_result = await session.execute(
            text("SELECT id, name, slug, roadmap_goals FROM projects WHERE id = :pid"),
            {"pid": str(project_id)},
        )
        proj_row = proj_result.fetchone()

        # ── Repos ─────────────────────────────────────────────────────────────
        repos_result = await session.execute(
            text("""
                SELECT git_url, local_path, branch_target
                FROM workspace_repos
                WHERE workspace_id = :wid
            """),
            {"wid": str(workspace_id)},
        )
        repos = [
            {
                "git_url": r.git_url,
                "local_path": r.local_path,
                "branch": r.branch_target,
            }
            for r in repos_result.fetchall()
        ]

        # ── Memories ──────────────────────────────────────────────────────────
        memories_result = await session.execute(
            text("""
                SELECT memory_type, content, created_at
                FROM memories
                WHERE workspace_id = :wid
                  AND memory_type IN ('failure', 'learning', 'architecture')
                  AND (expires_at IS NULL OR expires_at > NOW())
                ORDER BY created_at DESC
                LIMIT 8
            """),
            {"wid": str(workspace_id)},
        )
        memories = [
            {"type": r.memory_type, "content": r.content[:400]}
            for r in memories_result.fetchall()
        ]

        # ── Sibling tasks (same epic) ──────────────────────────────────────────
        sibling_tasks = []
        if task_row.parent_id:
            siblings_result = await session.execute(
                text("""
                    SELECT title, task_type, status, assigned_agent, model_hint
                    FROM tasks
                    WHERE parent_id = :parent AND id != :tid
                    LIMIT 10
                """),
                {"parent": str(task_row.parent_id), "tid": str(task_id)},
            )
            sibling_tasks = [
                {
                    "title": r.title,
                    "type": r.task_type,
                    "status": r.status,
                    "agent": r.assigned_agent,
                }
                for r in siblings_result.fetchall()
            ]

    # ── Knowledge search (Qdrant) ──────────────────────────────────────────────
    workspace_slug = ws_row.slug if ws_row else "demo"
    task_title = task_row.title
    task_desc = task_row.description or ""

    # Build a rich search query from the task
    search_query = f"{task_title}. {task_desc[:500]}"

    knowledge_snippets = await _search_workspace_knowledge(
        query=search_query,
        workspace_slug=workspace_slug,
        limit=8,
    )

    # ── Model route ────────────────────────────────────────────────────────────
    task_type_hint = task_row.model_hint or "coding"
    model_route = await _get_model_route(task_type_hint, workspace_id)

    # ── Assemble ──────────────────────────────────────────────────────────────
    return {
        "context_pack_version": "2.0",
        "task": {
            "id": str(task_row.id),
            "title": task_row.title,
            "description": task_row.description or "",
            "task_type": task_row.task_type,
            "acceptance_criteria": task_row.acceptance_criteria or {},
            "assigned_agent": task_row.assigned_agent,
            "model_hint": task_row.model_hint,
            "retry_count": task_row.retry_count,
            "max_retries": task_row.max_retries,
        },
        "workspace": {
            "id": str(ws_row.id) if ws_row else str(workspace_id),
            "name": ws_row.name if ws_row else "",
            "slug": workspace_slug,
            "lifecycle_state": ws_row.lifecycle_state if ws_row else "READY",
            "base_path": os.environ.get(
                "WORKSPACE_BASE_PATH",
                "/home/amr/AI-COMPANY-OS/11-WORKSPACES",
            ),
            "repos": repos,
        },
        "project": {
            "id": str(proj_row.id) if proj_row else str(project_id),
            "name": proj_row.name if proj_row else "",
            "roadmap_goals": proj_row.roadmap_goals if proj_row else "",
        },
        "memories": memories,
        "knowledge_snippets": knowledge_snippets,
        "sibling_tasks": sibling_tasks,
        "model_route": model_route,
        "knowledge_count": len(knowledge_snippets),
    }
