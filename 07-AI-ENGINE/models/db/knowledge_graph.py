"""
app/models/db/knowledge_graph.py
────────────────────────────────────────────────────────────────
Stores knowledge graph entities and relationships.

Entities: people, organizations, concepts, technologies, places
Relations: relates_to, part_of, created_by, used_in, mentions
"""

from __future__ import annotations

from sqlalchemy import String, Text, Float, Integer, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class GraphEntity(Base, TimestampMixin):
    __tablename__ = "graph_entities"

    id:          Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name:        Mapped[str] = mapped_column(String(255), nullable=False, unique=False)
    entity_type: Mapped[str] = mapped_column(String(50),  nullable=False)
    # CONCEPT | TECHNOLOGY | ORGANIZATION | PERSON | PLACE | PRODUCT | OTHER

    # Normalised name for deduplication
    canonical:   Mapped[str] = mapped_column(String(255), nullable=False, index=True)

    # Frequency — how often this entity appears
    frequency:   Mapped[int]   = mapped_column(Integer, default=1)
    importance:  Mapped[float] = mapped_column(Float,   default=0.5)

    # Sources where this entity was found
    sources:     Mapped[list | None] = mapped_column(JSON, nullable=True)

    __table_args__ = (
        Index("ix_graph_entities_type",      "entity_type"),
        Index("ix_graph_entities_importance","importance"),
    )

    def __repr__(self) -> str:
        return f"<GraphEntity {self.entity_type}:{self.name!r}>"


class GraphRelation(Base, TimestampMixin):
    __tablename__ = "graph_relations"

    id:            Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    from_entity_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    to_entity_id:   Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    relation_type:  Mapped[str] = mapped_column(String(100), nullable=False)
    # relates_to | part_of | created_by | used_in | mentions | depends_on

    weight:     Mapped[float] = mapped_column(Float, default=1.0)
    # How strong this relationship is (co-occurrence count)

    evidence:   Mapped[str | None] = mapped_column(Text, nullable=True)
    # Text snippet where the relationship was found

    __table_args__ = (
        Index("ix_graph_relations_from", "from_entity_id"),
        Index("ix_graph_relations_to",   "to_entity_id"),
        Index("ix_graph_relations_type", "relation_type"),
    )

    def __repr__(self) -> str:
        return f"<GraphRelation {self.from_entity_id} -{self.relation_type}-> {self.to_entity_id}>"
