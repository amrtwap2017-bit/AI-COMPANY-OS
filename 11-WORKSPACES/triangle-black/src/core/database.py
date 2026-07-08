"""
Triangle Black — PostgreSQL database connection
Uses the ai-postgres container on port 5432
Credentials: triangleblack / tb123
Database: triangle_black
"""
from __future__ import annotations
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool

DATABASE_URL = os.environ.get(
    "TRIANGLE_BLACK_DB_URL",
    "postgresql+psycopg2://triangleblack:tb123@127.0.0.1:5432/triangle_black",
)

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    poolclass=NullPool,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db() -> Session:
    """FastAPI dependency — yields a DB session, closes on exit."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_connection() -> bool:
    """Returns True if DB is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
