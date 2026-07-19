"""
app/models/db/memory_entry.py
─────────────────────────────────────────────────────
A single memory record stored by the memory layer.
"""

from sqlalchemy import String, Text, Float, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class MemoryEntry(Base, TimestampMixin):
    __tablename__ = "memory_entries"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    agent_name: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    memory_type: Mapped[str] = mapped_column(String(50), default="short_term")
    # short_term | long_term | semantic | episodic
    content: Mapped[str] = mapped_column(Text, nullable=False)
    importance: Mapped[float] = mapped_column(Float, default=0.5)
    vector_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    extra_data: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict)

    def __repr__(self) -> str:
        return f"<MemoryEntry id={self.id} type={self.memory_type!r}>"
