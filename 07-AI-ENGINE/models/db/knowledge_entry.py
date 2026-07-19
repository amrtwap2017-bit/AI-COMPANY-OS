"""
app/models/db/knowledge_entry.py
─────────────────────────────────────────────────────
Tracks chunks stored in the knowledge vector store.
Links PostgreSQL records to Qdrant vector IDs.

qdrant_id is BIGINT — timestamp-based IDs exceed INTEGER range.
Columns match the actual database schema exactly.
"""

from sqlalchemy import String, Text, Integer, BigInteger
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class KnowledgeEntry(Base, TimestampMixin):
    __tablename__ = "knowledge_entries"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    document_id: Mapped[int | None] = mapped_column(
        Integer, nullable=True, index=True
    )
    content: Mapped[str] = mapped_column(
        Text, nullable=False
    )
    source: Mapped[str | None] = mapped_column(
        String(1000), nullable=True
    )
    chunk_index: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    qdrant_id: Mapped[int | None] = mapped_column(
        BigInteger, nullable=True, index=True
    )

    def __repr__(self) -> str:
        return (
            f"<KnowledgeEntry id={self.id} "
            f"doc={self.document_id} "
            f"chunk={self.chunk_index}>"
        )
