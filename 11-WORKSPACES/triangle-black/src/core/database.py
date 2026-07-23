from __future__ import annotations
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

# Credentials: Docker ai-postgres container
# User: ai | Pass: ai123 | DB: triangle_black
_DB_URL = os.environ.get(
    "DATABASE_URL",
    os.environ.get(
        "TRIANGLE_BLACK_DB_URL",
        "postgresql+psycopg2://ai:ai123@127.0.0.1:5432/triangle_black"
    )
)

engine = create_engine(_DB_URL, pool_pre_ping=True, pool_size=5, max_overflow=10)


def check_connection() -> bool:
    """Check if DB is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


def get_db():
    """FastAPI dependency — yields DB session."""
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()
