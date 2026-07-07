"""
Wave 1 Exit Criteria Tests
===========================
These tests verify the Wave 1 foundation is intact.
Run with: pytest tests/test_wave1_exit_criteria.py -v
"""

import asyncio
import os
import pytest

os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://ai:ai123@localhost:5432/ai_company_os")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("QDRANT_HOST", "localhost")
os.environ.setdefault("QDRANT_PORT", "6333")
os.environ.setdefault("OLLAMA_BASE_URL", "http://localhost:11434")
os.environ.setdefault("WORKSPACE_BASE_PATH", "/tmp/ai-os-test-workspaces")
os.environ.setdefault("ENCRYPTION_MASTER_KEY", "")

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text


@pytest.fixture
async def db():
    engine = create_async_engine(os.environ["DATABASE_URL"], echo=False)
    async with engine.connect() as conn:
        yield conn
    await engine.dispose()


@pytest.mark.asyncio
async def test_database_connection(db):
    result = await db.execute(text("SELECT 1"))
    assert result.scalar_one() == 1


@pytest.mark.asyncio
async def test_pgvector_extension(db):
    result = await db.execute(
        text("SELECT extname FROM pg_extension WHERE extname = 'vector'")
    )
    assert result.scalar_one() == "vector"


@pytest.mark.asyncio
async def test_uuid_ossp_extension(db):
    result = await db.execute(
        text("SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp'")
    )
    assert result.scalar_one() == "uuid-ossp"


@pytest.mark.asyncio
async def test_all_21_tables_exist(db):
    expected = {
        "workspaces", "workspace_repos", "workspace_secrets",
        "workspace_agents", "workspace_models", "workspace_status",
        "projects", "project_repos", "project_releases",
        "repo_branches", "repo_commits", "repo_ownership",
        "tasks", "task_dependencies", "builder_runs",
        "quality_scores", "memories", "memory_tags", "memory_links",
        "tool_audit_log", "model_usage_log",
    }
    result = await db.execute(
        text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
    )
    found = {row[0] for row in result.fetchall()}
    missing = expected - found
    assert not missing, f"Missing tables: {missing}"


@pytest.mark.asyncio
async def test_workspaces_table_structure(db):
    result = await db.execute(
        text("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'workspaces'
            ORDER BY column_name
        """)
    )
    columns = {row[0] for row in result.fetchall()}
    required = {"id", "name", "slug", "lifecycle_state", "created_at"}
    assert required.issubset(columns)


@pytest.mark.asyncio
async def test_tasks_table_has_run_group(db):
    result = await db.execute(
        text("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'tasks' AND column_name = 'run_group'
        """)
    )
    assert result.scalar_one() == "run_group"


@pytest.mark.asyncio
async def test_tasks_table_has_acceptance_criteria(db):
    result = await db.execute(
        text("""
            SELECT data_type FROM information_schema.columns
            WHERE table_name = 'tasks' AND column_name = 'acceptance_criteria'
        """)
    )
    data_type = result.scalar_one()
    assert data_type in ("jsonb", "json")


@pytest.mark.asyncio
async def test_workspace_exists_in_db(db):
    result = await db.execute(
        text("SELECT COUNT(*) FROM workspaces WHERE slug = 'demo' OR slug = 'triangle-black'")
    )
    count = result.scalar_one()
    assert count >= 1, "At least one workspace should exist from Wave 1 tests"


@pytest.mark.asyncio
async def test_tasks_exist_in_db(db):
    result = await db.execute(text("SELECT COUNT(*) FROM tasks"))
    count = result.scalar_one()
    assert count >= 2, "At least 2 tasks should exist from Wave 1 tests"


@pytest.mark.asyncio
async def test_epic_subtasks_exist(db):
    result = await db.execute(
        text("SELECT COUNT(*) FROM tasks WHERE parent_id IS NOT NULL")
    )
    count = result.scalar_one()
    assert count >= 1, "At least 1 subtask should exist from Wave 2 planner"
