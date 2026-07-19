"""
app/db/database.py
────────────────────────────────────────────────────────────────
Database engine, session factory, and FastAPI dependency.

Pool settings are configurable via environment variables:
  DB_POOL_SIZE     default 10
  DB_MAX_OVERFLOW  default 20
  DB_POOL_TIMEOUT  default 30
  DB_POOL_RECYCLE  default 1800 (30 min)
"""

from __future__ import annotations

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from core.config import settings

# ── Engine ────────────────────────────────────────────────────
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,                   # detect stale connections
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    echo=settings.DEBUG and not settings.is_production,
)

# ── Session Factory ───────────────────────────────────────────
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ── FastAPI Dependency ────────────────────────────────────────
def get_db() -> Generator[Session, None, None]:
    """Yield a database session. Always closes after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Health check ──────────────────────────────────────────────
def check_db_connection() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


# ── Create all tables (used in init_db script) ────────────────
def create_all_tables() -> None:
    from db.base import Base
    import app.models.db.document        # noqa
    import app.models.db.conversation    # noqa
    import app.models.db.message         # noqa
    import app.models.db.agent_run       # noqa
    import app.models.db.memory_entry    # noqa
    import app.models.db.knowledge_entry # noqa
    Base.metadata.create_all(bind=engine)
