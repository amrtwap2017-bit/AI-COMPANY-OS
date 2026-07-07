"""
Wave 2 Exit Criteria Tests
===========================
Verifies intelligence layer: memory, planner, knowledge.
"""

import os
import pytest
from uuid import uuid4

os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://ai:ai123@localhost:5432/ai_company_os")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("QDRANT_HOST", "localhost")
os.environ.setdefault("QDRANT_PORT", "6333")
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
async def test_memories_table_exists(db):
    result = await db.execute(
        text("SELECT COUNT(*) FROM memories")
    )
    assert result.scalar_one() >= 0


@pytest.mark.asyncio
async def test_memory_types_are_valid(db):
    valid_types = {
        "conversation", "project", "architecture",
        "execution", "failure", "learning"
    }
    result = await db.execute(
        text("SELECT DISTINCT memory_type FROM memories")
    )
    found_types = {row[0] for row in result.fetchall()}
    invalid = found_types - valid_types
    assert not invalid, f"Invalid memory types found: {invalid}"


@pytest.mark.asyncio
async def test_learning_memory_has_no_expiry(db):
    result = await db.execute(
        text("""
            SELECT COUNT(*) FROM memories
            WHERE memory_type = 'learning'
            AND expires_at IS NULL
        """)
    )
    count = result.scalar_one()
    assert count >= 1, "At least one permanent learning memory should exist"


@pytest.mark.asyncio
async def test_planner_created_subtasks(db):
    result = await db.execute(
        text("""
            SELECT COUNT(*) FROM tasks
            WHERE parent_id IS NOT NULL
            AND task_type = 'story'
        """)
    )
    count = result.scalar_one()
    assert count >= 3, f"Planner should have created at least 3 subtasks, got {count}"


@pytest.mark.asyncio
async def test_subtasks_have_agent_assignments(db):
    result = await db.execute(
        text("""
            SELECT COUNT(*) FROM tasks
            WHERE parent_id IS NOT NULL
            AND assigned_agent IS NOT NULL
        """)
    )
    count = result.scalar_one()
    assert count >= 1, "Subtasks should have agent assignments"


@pytest.mark.asyncio
async def test_subtasks_have_model_hints(db):
    result = await db.execute(
        text("""
            SELECT COUNT(*) FROM tasks
            WHERE parent_id IS NOT NULL
            AND model_hint IS NOT NULL
        """)
    )
    count = result.scalar_one()
    assert count >= 1, "Subtasks should have model hints"


@pytest.mark.asyncio
async def test_chunker_import():
    import sys
    sys.path.insert(0, "/home/amr/AI-COMPANY-OS")
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "chunker", "/home/amr/AI-COMPANY-OS/03-KNOWLEDGE/chunker.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    chunker = module.DocumentChunker(chunk_size=500, chunk_overlap=50)
    chunks = chunker.chunk_document(
        "This is a test document. " * 50,
        "doc-123",
        "workspace-456",
    )
    assert len(chunks) > 0
    assert all(c.workspace_id == "workspace-456" for c in chunks)


@pytest.mark.asyncio
async def test_memory_keyword_search(db):
    result = await db.execute(
        text("""
            SELECT content FROM memories
            WHERE content ILIKE '%auth%'
            LIMIT 5
        """)
    )
    rows = result.fetchall()
    assert len(rows) >= 1, "Should find at least 1 memory about auth"
