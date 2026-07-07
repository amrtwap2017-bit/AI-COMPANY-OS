"""
Context Pack Builder
====================
Assembles all context an agent needs before execution.

A context pack contains:
  workspace_config   — workspace settings, paths, models
  task               — full task with acceptance criteria
  project            — project roadmap and metadata
  relevant_memories  — failures, learnings, architecture decisions
  knowledge_snippets — relevant documents from knowledge base
  repo_context       — file structure, recent commits, ownership
  model_route        — which model to use for this task type

Context packs are assembled BEFORE every agent invocation.
No agent runs without a context pack.
"""

from __future__ import annotations

import os
from typing import Any
from uuid import UUID

import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession


def _get_factory():
    url = os.environ.get("DATABASE_URL", "postgresql+asyncpg://ai:ai123@localhost:5432/ai_company_os")
    engine = create_async_engine(url, echo=False)
    return async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def build_context_pack(
    task_id: UUID,
    workspace_id: UUID,
    project_id: UUID,
) -> dict[str, Any]:
    """
    Assemble the complete context pack for a task execution.

    This is called at the START of every autonomous pipeline run.
    The context pack is passed to every agent in the chain.

    Returns a structured dict with all context needed for execution.
    """
    factory = _get_factory()

    async with factory() as session:
        # Load task
        task_result = await session.execute(
            text("""
                SELECT id, title, description, task_type, acceptance_criteria,
                       assigned_agent, model_hint, status, retry_count,
                       max_retries, run_group, parent_id
                FROM tasks WHERE id = :tid AND workspace_id = :wid
            """),
            {"tid": str(task_id), "wid": str(workspace_id)},
        )
        task_row = task_result.fetchone()
        if not task_row:
            return {"error": f"Task {task_id} not found"}

        # Load workspace
        ws_result = await session.execute(
            text("SELECT id, name, slug, lifecycle_state FROM workspaces WHERE id = :wid"),
            {"wid": str(workspace_id)},
        )
        ws_row = ws_result.fetchone()

        # Load project
        proj_result = await session.execute(
            text("SELECT id, name, slug, roadmap_goals FROM projects WHERE id = :pid"),
            {"pid": str(project_id)},
        )
        proj_row = proj_result.fetchone()

        # Load workspace repos
        repos_result = await session.execute(
            text("SELECT git_url, local_path, branch_target FROM workspace_repos WHERE workspace_id = :wid"),
            {"wid": str(workspace_id)},
        )
        repos = [{"git_url": r.git_url, "local_path": r.local_path, "branch": r.branch_target}
                 for r in repos_result.fetchall()]

        # Load recent memories (failures and learnings)
        memories_result = await session.execute(
            text("""
                SELECT memory_type, content, created_at
                FROM memories
                WHERE workspace_id = :wid
                  AND memory_type IN ('failure', 'learning', 'architecture')
                  AND (expires_at IS NULL OR expires_at > NOW())
                ORDER BY created_at DESC
                LIMIT 10
            """),
            {"wid": str(workspace_id)},
        )
        memories = [
            {"type": r.memory_type, "content": r.content[:500]}
            for r in memories_result.fetchall()
        ]

        # Load sibling tasks (context from same epic)
        sibling_tasks = []
        if task_row.parent_id:
            siblings_result = await session.execute(
                text("""
                    SELECT title, task_type, status, assigned_agent
                    FROM tasks
                    WHERE parent_id = :parent AND id != :tid
                    LIMIT 10
                """),
                {"parent": str(task_row.parent_id), "tid": str(task_id)},
            )
            sibling_tasks = [
                {"title": r.title, "type": r.task_type, "status": r.status, "agent": r.assigned_agent}
                for r in siblings_result.fetchall()
            ]

    # Determine model route
    model_route = await _get_model_route(
        task_type=task_row.model_hint or "coding",
        workspace_id=workspace_id,
    )

    return {
        "context_pack_version": "1.0",
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
            "slug": ws_row.slug if ws_row else "",
            "lifecycle_state": ws_row.lifecycle_state if ws_row else "READY",
            "base_path": os.environ.get("WORKSPACE_BASE_PATH", "/home/amr/AI-COMPANY-OS/11-WORKSPACES"),
            "repos": repos,
        },
        "project": {
            "id": str(proj_row.id) if proj_row else str(project_id),
            "name": proj_row.name if proj_row else "",
            "roadmap_goals": proj_row.roadmap_goals if proj_row else "",
        },
        "memories": memories,
        "sibling_tasks": sibling_tasks,
        "model_route": model_route,
        "knowledge_snippets": [],
    }


async def _get_model_route(task_type: str, workspace_id: UUID) -> dict[str, Any]:
    """Get model routing for this task type."""
    LOCAL_ROUTES = {
        "coding":        {"model_id": "llama3.2:3b",  "provider": "ollama", "endpoint": "http://localhost:11434"},
        "architecture":  {"model_id": "qwen2.5-coder:14b", "provider": "ollama", "endpoint": "http://localhost:11434"},
        "testing":       {"model_id": "llama3.2:3b",  "provider": "ollama", "endpoint": "http://localhost:11434"},
        "fast_review":   {"model_id": "llama3.2:3b",  "provider": "ollama", "endpoint": "http://localhost:11434"},
        "security_scan": {"model_id": "llama3.2:3b",  "provider": "ollama", "endpoint": "http://localhost:11434"},
        "documentation": {"model_id": "llama3.2:3b",  "provider": "ollama", "endpoint": "http://localhost:11434"},
    }
    route = LOCAL_ROUTES.get(task_type, LOCAL_ROUTES["coding"])
    route["context_window"] = 32768
    route["is_local"] = True
    return route
