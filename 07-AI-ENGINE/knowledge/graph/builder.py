"""
app/knowledge/graph/builder.py
────────────────────────────────────────────────────────────────
Builds the knowledge graph from ingested documents.

Pipeline:
  1. Load knowledge entries from PostgreSQL
  2. Extract entities from each chunk
  3. Create GraphEntity records (merge duplicates)
  4. Create GraphRelation records (co-occurrence)
  5. Return build statistics

Relations are created when two entities appear
in the same chunk of text (co-occurrence).
Relation weight increases each time they co-occur.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from sqlalchemy.orm import Session
from sqlalchemy import func

from knowledge.graph.extractor import EntityExtractor, ExtractedEntity
from models.db.knowledge_entry import KnowledgeEntry
from models.db.knowledge_graph import GraphEntity, GraphRelation

log = logging.getLogger(__name__)


@dataclass
class GraphBuildResult:
    entities_created:  int
    entities_updated:  int
    relations_created: int
    relations_updated: int
    chunks_processed:  int
    errors:            int


class KnowledgeGraphBuilder:

    def __init__(self, db: Session) -> None:
        self._db        = db
        self._extractor = EntityExtractor()

    def build_from_all(
        self,
        limit:    int  = 500,
        min_freq: int  = 1,
    ) -> GraphBuildResult:
        """
        Build the knowledge graph from all knowledge entries.
        Safe to call multiple times — updates existing entities.
        """
        entries = (
            self._db.query(KnowledgeEntry)
            .limit(limit)
            .all()
        )

        return self._process_entries(entries)

    def build_from_document(
        self,
        document_id: int,
    ) -> GraphBuildResult:
        """Build graph from a specific document's chunks."""
        entries = (
            self._db.query(KnowledgeEntry)
            .filter(KnowledgeEntry.document_id == document_id)
            .all()
        )
        return self._process_entries(entries)

    def _process_entries(
        self,
        entries: list[KnowledgeEntry],
    ) -> GraphBuildResult:
        created_e = updated_e = created_r = updated_r = errors = 0

        for entry in entries:
            try:
                entities = self._extractor.extract(
                    entry.content,
                    source=entry.source or "",
                )

                # Upsert entities
                entity_ids: list[int] = []
                for extracted in entities:
                    entity_id, was_created = self._upsert_entity(
                        extracted, entry.source or ""
                    )
                    entity_ids.append(entity_id)
                    if was_created:
                        created_e += 1
                    else:
                        updated_e += 1

                # Create co-occurrence relations
                for i, eid1 in enumerate(entity_ids):
                    for eid2 in entity_ids[i + 1:]:
                        if eid1 == eid2:
                            continue
                        was_created = self._upsert_relation(
                            from_id=min(eid1, eid2),
                            to_id=max(eid1, eid2),
                            relation_type="relates_to",
                            evidence=entry.content[:200],
                        )
                        if was_created:
                            created_r += 1
                        else:
                            updated_r += 1

            except Exception as exc:
                log.debug("Graph build error for entry %d: %s", entry.id, exc)
                errors += 1

        self._db.commit()

        return GraphBuildResult(
            entities_created=created_e,
            entities_updated=updated_e,
            relations_created=created_r,
            relations_updated=updated_r,
            chunks_processed=len(entries),
            errors=errors,
        )

    def _upsert_entity(
        self,
        extracted: ExtractedEntity,
        source:    str,
    ) -> tuple[int, bool]:
        """Insert or update a GraphEntity. Returns (id, was_created)."""
        existing = (
            self._db.query(GraphEntity)
            .filter(GraphEntity.canonical == extracted.canonical)
            .first()
        )

        if existing:
            existing.frequency += 1
            existing.importance = min(1.0, existing.importance + 0.01)
            if source and source not in (existing.sources or []):
                sources = list(existing.sources or [])
                sources.append(source)
                existing.sources = sources[:20]   # cap at 20 sources
            return existing.id, False

        entity = GraphEntity(
            name=extracted.text,
            entity_type=extracted.entity_type,
            canonical=extracted.canonical,
            frequency=1,
            importance=0.3,
            sources=[source] if source else [],
        )
        self._db.add(entity)
        self._db.flush()   # get ID without committing
        return entity.id, True

    def _upsert_relation(
        self,
        from_id:       int,
        to_id:         int,
        relation_type: str,
        evidence:      str,
    ) -> bool:
        """Insert or update a GraphRelation. Returns was_created."""
        existing = (
            self._db.query(GraphRelation)
            .filter(
                GraphRelation.from_entity_id == from_id,
                GraphRelation.to_entity_id   == to_id,
                GraphRelation.relation_type  == relation_type,
            )
            .first()
        )

        if existing:
            existing.weight += 0.1
            return False

        relation = GraphRelation(
            from_entity_id=from_id,
            to_entity_id=to_id,
            relation_type=relation_type,
            weight=1.0,
            evidence=evidence,
        )
        self._db.add(relation)
        return True


graph_builder_factory = KnowledgeGraphBuilder
