"""Shared DB engine — connects to same ai_hub postgres as Hub."""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session

POSTGRES_DSN = os.environ.get(
    "POSTGRES_DSN",
    "postgresql+psycopg://postgres:postgres@127.0.0.1:55432/ai_hub"
)

engine = create_engine(POSTGRES_DSN, future=True, pool_pre_ping=True)

class Base(DeclarativeBase):
    pass
