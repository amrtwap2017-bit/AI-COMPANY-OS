"""
app/models/db/document.py
─────────────────────────────────────────────────────
Stores raw documents ingested into the knowledge base.

Columns match the actual database schema exactly.
This is now the canonical Document model.
app/models/document.py is the legacy location — both exist.
"""

from sqlalchemy import String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    title: Mapped[str] = mapped_column(
        String(500), nullable=False
    )
    source: Mapped[str | None] = mapped_column(
        String(1000), nullable=True
    )
    content: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    doc_type: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(50), default="pending"
    )
    # pending | indexed | failed
    chunk_count: Mapped[int] = mapped_column(
        Integer, default=0
    )
    file_type: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )

    def __repr__(self) -> str:
        return f"<Document id={self.id} title={self.title!r}>"
