"""
app/models/db/api_key.py
─────────────────────────────────────────────────────
API key for programmatic access.

Columns match the actual database schema exactly.
key_hash stores bcrypt hash of the key.
key_prefix stores first 8 chars for display.
"""

from sqlalchemy import String, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class APIKey(Base, TimestampMixin):
    __tablename__ = "api_keys"

    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True
    )
    user_id: Mapped[int] = mapped_column(
        Integer, nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    key_hash: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    key_prefix: Mapped[str] = mapped_column(
        String(10), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True
    )
    permissions: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )

    def __repr__(self) -> str:
        return f"<APIKey id={self.id} prefix={self.key_prefix!r}>"
