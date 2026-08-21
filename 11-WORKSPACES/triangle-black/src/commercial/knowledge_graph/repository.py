"""
Repository for Knowledge Graph Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

class KnowledgeGraphRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_graph_counts(self, hotel_id: str) -> Dict[str, int]:
        nodes_cnt = self.db.execute(text("SELECT COUNT(*) FROM twin_nodes WHERE hotel_id=:hid"), {"hid": hotel_id}).scalar() or 0
        edges_cnt = self.db.execute(text("SELECT COUNT(*) FROM twin_edges WHERE hotel_id=:hid"), {"hid": hotel_id}).scalar() or 0
        return {"total_nodes": int(nodes_cnt), "total_edges": int(edges_cnt)}

    def get_entity_connections(self, entity_id: str, hotel_id: str) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT id, source_type, source_id, target_type, target_id, relationship
            FROM twin_edges
            WHERE hotel_id = :hid
              AND (source_id = :eid OR target_id = :eid)
        """), {"hid": hotel_id, "eid": entity_id}).fetchall()
        return [dict(r._mapping) for r in rows]
