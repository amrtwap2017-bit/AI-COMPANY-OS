"""
app/models/db/user.py
─────────────────────────────────────────────────────
Platform user. Supports JWT login and API key auth.

Columns match the actual database schema exactly.
"""

from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True
    )
    username: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    email: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    hashed_password: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    full_name: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    role: Mapped[str] = mapped_column(
        String(50), default="user"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True
    )
    is_admin: Mapped[bool] = mapped_column(
        Boolean, default=False
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} username={self.username!r}>"
