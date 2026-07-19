"""
app/api/v1/routes/graph.py
Knowledge Graph API endpoints.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from db.database import get_db
from knowledge.graph.builder import KnowledgeGraphBuilder
from knowledge.graph.query   import KnowledgeGraphQuery

router = APIRouter()


@router.post("/graph/build")
def build_graph(
    limit: int = Query(default=500, ge=1, le=5000),
    db: Session = Depends(get_db),
) -> dict:
    """
    Build the knowledge graph from all ingested documents.
    Extracts entities and relations from knowledge entries.
    Safe to call multiple times — updates existing records.
    """
    builder = KnowledgeGraphBuilder(db)
    result  = builder.build_from_all(limit=limit)

    return {
        "entities_created":  result.entities_created,
        "entities_updated":  result.entities_updated,
        "relations_created": result.relations_created,
        "relations_updated": result.relations_updated,
        "chunks_processed":  result.chunks_processed,
        "errors":            result.errors,
    }


@router.get("/graph/stats")
def graph_stats(db: Session = Depends(get_db)) -> dict:
    """Graph statistics: entity counts by type, relation count."""
    return KnowledgeGraphQuery(db).stats()


@router.get("/graph/entities")
def search_entities(
    query:       str         = Query(..., min_length=1),
    entity_type: str | None  = Query(default=None),
    limit:       int         = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> dict:
    """Search entities by name."""
    results = KnowledgeGraphQuery(db).search_entities(
        query=query,
        entity_type=entity_type,
        limit=limit,
    )
    return {
        "query":   query,
        "count":   len(results),
        "entities": [
            {
                "id":          r.id,
                "name":        r.name,
                "type":        r.entity_type,
                "frequency":   r.frequency,
                "importance":  r.importance,
            }
            for r in results
        ],
    }


@router.get("/graph/neighborhood/{entity_name}")
def get_neighborhood(
    entity_name: str,
    hops:  int = Query(default=2, ge=1, le=3),
    db: Session = Depends(get_db),
) -> dict:
    """Get the N-hop neighborhood of an entity for graph visualisation."""
    return KnowledgeGraphQuery(db).get_neighborhood(
        entity_name=entity_name,
        hops=hops,
    )


@router.get("/graph/related/{entity_id}")
def get_related(
    entity_id:    int,
    relation_type: str | None = Query(default=None),
    limit:         int        = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
) -> dict:
    """Get entities directly related to a given entity."""
    results = KnowledgeGraphQuery(db).get_related(
        entity_id=entity_id,
        relation_type=relation_type,
        limit=limit,
    )
    return {
        "entity_id": entity_id,
        "count":     len(results),
        "related": [
            {
                "id":        r.id,
                "name":      r.name,
                "type":      r.entity_type,
                "relation":  r.relation,
                "weight":    r.weight,
                "importance": r.importance,
            }
            for r in results
        ],
    }


@router.get("/graph/hubs")
def get_hubs(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> dict:
    """Return the most connected hub entities in the graph."""
    results = KnowledgeGraphQuery(db).get_most_connected(limit=limit)
    return {
        "count": len(results),
        "hubs": [
            {
                "id":         r.id,
                "name":       r.name,
                "type":       r.entity_type,
                "connections": int(r.weight or 0),
                "importance": r.importance,
            }
            for r in results
        ],
    }
