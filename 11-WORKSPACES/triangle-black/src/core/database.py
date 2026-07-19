

def check_connection() -> bool:
    """Check if DB is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(__import__('sqlalchemy').text("SELECT 1"))
        return True
    except Exception:
        return False


# Aliases for compatibility
from sqlalchemy import create_engine as _create_engine, text as _text
import os as _os

_DB_URL = _os.environ.get(
    "TRIANGLE_BLACK_DB_URL",
    "postgresql+psycopg2://triangleblack:tb123@127.0.0.1:5432/triangle_black"
)

engine = _create_engine(_DB_URL, pool_pre_ping=True)


def check_connection() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(_text("SELECT 1"))
        return True
    except Exception:
        return False


def get_db():
    """FastAPI dependency — yields DB session."""
    from sqlalchemy.orm import Session as _Session
    db = _Session(engine)
    try:
        yield db
    finally:
        db.close()
