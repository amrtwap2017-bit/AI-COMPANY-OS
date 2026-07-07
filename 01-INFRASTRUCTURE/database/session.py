"""
Database Session Manager
========================
Manages PostgreSQL connection pools for the platform.

Uses SQLAlchemy 2.0 async engine with asyncpg driver.
Every database operation must use the session dependency.

Connection isolation:
- All queries are workspace-scoped at the application layer
- Row-level security is enforced via workspace_id WHERE clauses
- No raw SQL without workspace_id filter is permitted

Pool configuration:
- pool_size=10 per service instance
- max_overflow=20 for burst capacity
- pool_pre_ping=True to detect stale connections
"""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy import event, text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase


# ─── Base Model ───────────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    """
    SQLAlchemy declarative base for all platform ORM models.
    All table models in 02-PLATFORM must inherit from this.
    """
    pass


# ─── Engine Factory ───────────────────────────────────────────────────────────

def build_async_engine(database_url: str | None = None) -> AsyncEngine:
    """
    Build the async SQLAlchemy engine.

    Reads DATABASE_URL from environment if not provided.
    Converts postgresql:// to postgresql+asyncpg:// if needed.
    """
    url = database_url or os.environ.get("DATABASE_URL", "")

    if not url:
        raise RuntimeError(
            "DATABASE_URL environment variable is not set. "
            "Check ~/AI-COMPANY-OS/.env and ensure it is loaded."
        )

    # Normalise URL scheme for asyncpg
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)

    return create_async_engine(
        url,
        echo=os.environ.get("DEBUG", "false").lower() == "true",
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=3600,
    )


# ─── Session Factory ──────────────────────────────────────────────────────────

def build_session_factory(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    """Build the async session factory from an engine."""
    return async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )


# ─── Singleton Engine & Session ───────────────────────────────────────────────

_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
    """Return the singleton async engine. Creates it on first call."""
    global _engine
    if _engine is None:
        _engine = build_async_engine()
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Return the singleton session factory. Creates it on first call."""
    global _session_factory
    if _session_factory is None:
        _session_factory = build_session_factory(get_engine())
    return _session_factory


# ─── FastAPI Dependency ───────────────────────────────────────────────────────

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session per request.

    Usage in route:
        @router.get("/workspaces")
        async def list_workspaces(db: AsyncSession = Depends(get_db_session)):
            ...

    The session is automatically committed on success and rolled back
    on any exception, then closed regardless.
    """
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ─── Context Manager for Non-FastAPI Use ──────────────────────────────────────

@asynccontextmanager
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Async context manager for database sessions outside FastAPI.

    Usage in agents and services:
        async with db_session() as session:
            result = await session.execute(...)

    Always use this instead of raw engine.connect() calls.
    """
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ─── Health Check ─────────────────────────────────────────────────────────────

async def check_database_health() -> dict:
    """
    Verify database connectivity and extension availability.
    Used by the platform health endpoint.

    Returns:
        {
            "connected": bool,
            "version": str,
            "pgvector": bool,
            "uuid_ossp": bool,
            "pool_size": int,
        }
    """
    try:
        async with db_session() as session:
            result = await session.execute(text("SELECT version()"))
            version_row = result.scalar_one()

            vector_result = await session.execute(
                text(
                    "SELECT COUNT(*) FROM pg_extension WHERE extname = 'vector'"
                )
            )
            vector_installed = vector_result.scalar_one() > 0

            uuid_result = await session.execute(
                text(
                    "SELECT COUNT(*) FROM pg_extension WHERE extname = 'uuid-ossp'"
                )
            )
            uuid_installed = uuid_result.scalar_one() > 0

        engine = get_engine()
        pool = engine.pool

        return {
            "connected": True,
            "version": version_row,
            "pgvector": vector_installed,
            "uuid_ossp": uuid_installed,
            "pool_size": pool.size(),
            "pool_checked_out": pool.checkedout(),
        }
    except Exception as exc:
        return {
            "connected": False,
            "error": str(exc),
            "pgvector": False,
            "uuid_ossp": False,
        }


# ─── Lifecycle ────────────────────────────────────────────────────────────────

async def init_database() -> None:
    """
    Called at application startup.
    Creates all tables if they do not exist.
    In production, Alembic migrations are used instead.
    """
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_database() -> None:
    """Called at application shutdown. Disposes the connection pool."""
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _session_factory = None
