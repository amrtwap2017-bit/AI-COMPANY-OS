"""
Service for Knowledge Graph Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from src.commercial.knowledge_graph.repository import KnowledgeGraphRepository

class KnowledgeGraphService:
    def __init__(self, db: Session):
        self.repo = KnowledgeGraphRepository(db)

    def get_overview(self, hotel_id: str) -> Dict[str, Any]:
        counts = self.repo.get_graph_counts(hotel_id)
        return {
            "hotel_id": hotel_id,
            "total_nodes": counts.get("total_nodes", 0),
            "total_edges": counts.get("total_edges", 0)
        }

    def get_entity_relationships(self, entity_id: str, hotel_id: str) -> Dict[str, Any]:
        edges = self.repo.get_entity_connections(entity_id, hotel_id)
        return {
            "entity_id": entity_id,
            "hotel_id": hotel_id,
            "connection_count": len(edges),
            "relationships": edges
        }
