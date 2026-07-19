"""
app/knowledge/graph/query.py
────────────────────────────────────────────────────────────────
Queries the knowledge graph.

Provides:
  search_entities()      → find entities by name/type
  get_related()          → find entities related to a given entity
  get_neighborhood()     → N-hop neighborhood of an entity
  find_path()            → shortest path between two entities
  get_most_connected()   → most important hub entities
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.db.knowledge_graph import GraphEntity, GraphRelation

log = logging.getLogger(__name__)


@dataclass
class EntityResult:
    id:          int
    name:        str
    entity_type: str
    frequency:   int
    importance:  float
    relation:    str | None  = None
    weight:      float | None = None


class KnowledgeGraphQuery:

    def __init__(self, db: Session) -> None:
        self._db = db

    def search_entities(
        self,
        query:       str,
        entity_type: str | None = None,
        limit:       int        = 20,
    ) -> list[EntityResult]:
        """Search entities by name."""
        q = self._db.query(GraphEntity).filter(
            GraphEntity.canonical.ilike(f"%{query.lower()}%")
        )
        if entity_type:
            q = q.filter(GraphEntity.entity_type == entity_type)

        entities = (
            q.order_by(GraphEntity.importance.desc())
            .limit(limit)
            .all()
        )

        return [self._to_result(e) for e in entities]

    def get_related(
        self,
        entity_id:    int,
        relation_type: str | None = None,
        limit:         int        = 10,
    ) -> list[EntityResult]:
        """Get entities directly related to a given entity."""
        q = (
            self._db.query(GraphRelation, GraphEntity)
            .join(
                GraphEntity,
                (GraphEntity.id == GraphRelation.from_entity_id) |
                (GraphEntity.id == GraphRelation.to_entity_id)
            )
            .filter(
                ((GraphRelation.from_entity_id == entity_id) |
                 (GraphRelation.to_entity_id   == entity_id)) &
                (GraphEntity.id != entity_id)
            )
        )

        if relation_type:
            q = q.filter(GraphRelation.relation_type == relation_type)

        rows = (
            q.order_by(GraphRelation.weight.desc())
            .limit(limit)
            .all()
        )

        results = []
        for relation, entity in rows:
            r = self._to_result(entity)
            r.relation = relation.relation_type
            r.weight   = relation.weight
            results.append(r)

        return results

    def get_neighborhood(
        self,
        entity_name: str,
        hops:        int = 2,
        limit:       int = 50,
    ) -> dict:
        """
        Get the N-hop neighborhood of an entity.
        Returns {entities: [...], relations: [...]} for graph visualisation.
        """
        # Find the starting entity
        start = (
            self._db.query(GraphEntity)
            .filter(GraphEntity.canonical.ilike(f"%{entity_name.lower()}%"))
            .order_by(GraphEntity.importance.desc())
            .first()
        )

        if not start:
            return {"entities": [], "relations": [], "center": None}

        # BFS up to `hops` levels
        visited_ids:    set[int]       = {start.id}
        all_entities:   list[GraphEntity]  = [start]
        all_relations:  list[GraphRelation] = []
        frontier        = {start.id}

        for _ in range(hops):
            if not frontier:
                break
            relations = (
                self._db.query(GraphRelation)
                .filter(
                    (GraphRelation.from_entity_id.in_(frontier)) |
                    (GraphRelation.to_entity_id.in_(frontier))
                )
                .order_by(GraphRelation.weight.desc())
                .limit(limit)
                .all()
            )

            new_frontier: set[int] = set()
            for rel in relations:
                all_relations.append(rel)
                for eid in (rel.from_entity_id, rel.to_entity_id):
                    if eid not in visited_ids:
                        visited_ids.add(eid)
                        new_frontier.add(eid)

            if new_frontier:
                new_entities = (
                    self._db.query(GraphEntity)
                    .filter(GraphEntity.id.in_(new_frontier))
                    .all()
                )
                all_entities.extend(new_entities)

            frontier = new_frontier

        return {
            "center": self._to_result(start),
            "entities": [self._to_result(e) for e in all_entities],
            "relations": [
                {
                    "from":   r.from_entity_id,
                    "to":     r.to_entity_id,
                    "type":   r.relation_type,
                    "weight": r.weight,
                }
                for r in all_relations
            ],
        }

    def get_most_connected(self, limit: int = 20) -> list[EntityResult]:
        """Return the most connected (highest degree) entities."""
        from sqlalchemy import or_

        counts = (
            self._db.query(
                GraphEntity.id,
                func.count(GraphRelation.id).label("degree"),
            )
            .outerjoin(
                GraphRelation,
                or_(
                    GraphRelation.from_entity_id == GraphEntity.id,
                    GraphRelation.to_entity_id   == GraphEntity.id,
                )
            )
            .group_by(GraphEntity.id)
            .order_by(func.count(GraphRelation.id).desc())
            .limit(limit)
            .all()
        )

        results = []
        for row in counts:
            entity = self._db.query(GraphEntity).filter(
                GraphEntity.id == row.id
            ).first()
            if entity:
                r = self._to_result(entity)
                r.weight = float(row.degree)
                results.append(r)

        return results

    def stats(self) -> dict:
        """Graph statistics."""
        entity_count   = self._db.query(func.count(GraphEntity.id)).scalar() or 0
        relation_count = self._db.query(func.count(GraphRelation.id)).scalar() or 0

        type_counts = (
            self._db.query(
                GraphEntity.entity_type,
                func.count(GraphEntity.id).label("count"),
            )
            .group_by(GraphEntity.entity_type)
            .all()
        )

        return {
            "total_entities":  entity_count,
            "total_relations": relation_count,
            "entity_types":    {r.entity_type: r.count for r in type_counts},
        }

    def _to_result(self, e: GraphEntity) -> EntityResult:
        return EntityResult(
            id=e.id,
            name=e.name,
            entity_type=e.entity_type,
            frequency=e.frequency,
            importance=e.importance,
        )


graph_query_factory = KnowledgeGraphQuery
