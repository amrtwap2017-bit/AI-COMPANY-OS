"""
Digital Twin Event Projector — T-011
Reads domain events from platform_events outbox and projects
into twin_nodes and twin_edges for graph-based queries.

Architecture:
  Relational source (work_orders, assets, etc.)
  → platform_events outbox
  → TwinProjector.process_pending()
  → twin_nodes + twin_edges
  → Graph queries via TwinQuery

Graph failures NEVER block transactional operations.
"""
from __future__ import annotations
import uuid
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text


class TwinProjector:
    """
    Projects domain events into a lightweight graph structure.
    twin_nodes: entities (assets, WOs, technicians, suppliers)
    twin_edges: relationships between entities
    """

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def project_event(self, event: Dict[str, Any]) -> bool:
        """Project a single event into twin graph. Returns True on success."""
        try:
            event_type = event.get("event_type", "")
            payload = event.get("payload", "{}")
            if isinstance(payload, str):
                payload = json.loads(payload)

            if "work_order" in event_type:
                self._project_work_order(event, payload)
            elif "asset" in event_type:
                self._project_asset(event, payload)
            elif "service_request" in event_type:
                self._project_service_request(event, payload)
            return True
        except Exception:
            return False

    def _project_work_order(self, event: Dict, payload: Dict) -> None:
        """Project WO events into twin nodes and edges."""
        wo_id = event.get("aggregate_id", "")
        self._upsert_node(
            entity_type="work_order",
            entity_id=wo_id,
            label=f"WO:{wo_id[:8]}",
            properties={"status": payload.get("status", "unknown"),
                        "event": event.get("event_type")},
        )
        # Link WO to service report if present
        sr_id = payload.get("service_report_id")
        if sr_id:
            self._upsert_edge(
                source_type="work_order", source_id=wo_id,
                target_type="service_report", target_id=sr_id,
                relationship="generated",
            )

    def _project_asset(self, event: Dict, payload: Dict) -> None:
        """Project asset events."""
        asset_id = event.get("aggregate_id", "")
        self._upsert_node(
            entity_type="asset",
            entity_id=asset_id,
            label=f"Asset:{asset_id[:8]}",
            properties={"event": event.get("event_type")},
        )

    def _project_service_request(self, event: Dict, payload: Dict) -> None:
        """Project SR events and link to WO if generated."""
        sr_id = event.get("aggregate_id", "")
        self._upsert_node(
            entity_type="service_request",
            entity_id=sr_id,
            label=f"SR:{sr_id[:8]}",
            properties={"status": payload.get("status", "unknown")},
        )
        wo_id = payload.get("work_order_id")
        if wo_id:
            self._upsert_edge(
                source_type="service_request", source_id=sr_id,
                target_type="work_order", target_id=wo_id,
                relationship="generated_wo",
            )

    def _upsert_node(self, entity_type: str, entity_id: str,
                     label: str, properties: Dict) -> None:
        """Insert or update a twin node."""
        try:
            existing = self.db.execute(text(
                """SELECT id FROM twin_nodes
                   WHERE hotel_id=:hid AND entity_type=:et AND entity_id=:eid
                   LIMIT 1"""
            ), {"hid": self.hotel_id, "et": entity_type, "eid": entity_id}).fetchone()
            if existing:
                self.db.execute(text(
                    """UPDATE twin_nodes SET properties=:props, updated_at=:now
                       WHERE hotel_id=:hid AND entity_type=:et AND entity_id=:eid"""
                ), {"props": json.dumps(properties), "now": datetime.utcnow(),
                    "hid": self.hotel_id, "et": entity_type, "eid": entity_id})
            else:
                self.db.execute(text(
                    """INSERT INTO twin_nodes
                       (id, hotel_id, entity_type, entity_id, label, properties, created_at, updated_at)
                       VALUES (:id, :hid, :et, :eid, :label, :props, :now, :now)"""
                ), {"id": str(uuid.uuid4()), "hid": self.hotel_id,
                    "et": entity_type, "eid": entity_id, "label": label,
                    "props": json.dumps(properties), "now": datetime.utcnow()})
            self.db.commit()
        except Exception:
            try:
                self.db.rollback()
            except Exception:
                pass

    def _upsert_edge(self, source_type: str, source_id: str,
                     target_type: str, target_id: str,
                     relationship: str) -> None:
        """Insert a twin edge if not exists."""
        try:
            existing = self.db.execute(text(
                """SELECT id FROM twin_edges
                   WHERE hotel_id=:hid AND source_id=:sid AND target_id=:tid
                   LIMIT 1"""
            ), {"hid": self.hotel_id, "sid": source_id, "tid": target_id}).fetchone()
            if not existing:
                self.db.execute(text(
                    """INSERT INTO twin_edges
                       (id, hotel_id, source_type, source_id, target_type, target_id,
                        relationship, created_at)
                       VALUES (:id, :hid, :st, :sid, :tt, :tid, :rel, :now)"""
                ), {"id": str(uuid.uuid4()), "hid": self.hotel_id,
                    "st": source_type, "sid": source_id,
                    "tt": target_type, "tid": target_id,
                    "rel": relationship, "now": datetime.utcnow()})
                self.db.commit()
        except Exception:
            try:
                self.db.rollback()
            except Exception:
                pass


class TwinQuery:
    """Query the twin graph for impact analysis."""

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def get_node(self, entity_type: str, entity_id: str) -> Optional[Dict]:
        try:
            row = self.db.execute(text(
                """SELECT * FROM twin_nodes
                   WHERE hotel_id=:hid AND entity_type=:et AND entity_id=:eid"""
            ), {"hid": self.hotel_id, "et": entity_type, "eid": entity_id}).fetchone()
            return dict(row._mapping) if row else None
        except Exception:
            return None

    def get_impact(self, entity_type: str, entity_id: str) -> Dict[str, Any]:
        """Get all entities connected to this entity."""
        try:
            edges = self.db.execute(text(
                """SELECT * FROM twin_edges
                   WHERE hotel_id=:hid
                     AND (source_id=:eid OR target_id=:eid)"""
            ), {"hid": self.hotel_id, "eid": entity_id}).fetchall()
            return {
                "entity_type": entity_type,
                "entity_id": entity_id,
                "hotel_id": self.hotel_id,
                "connected_count": len(edges),
                "edges": [dict(r._mapping) for r in edges],
            }
        except Exception:
            return {"entity_type": entity_type, "entity_id": entity_id,
                    "hotel_id": self.hotel_id, "connected_count": 0, "edges": []}

    def get_stats(self) -> Dict[str, Any]:
        try:
            nodes = self.db.execute(text(
                "SELECT COUNT(*) FROM twin_nodes WHERE hotel_id=:hid"
            ), {"hid": self.hotel_id}).fetchone()
            edges = self.db.execute(text(
                "SELECT COUNT(*) FROM twin_edges WHERE hotel_id=:hid"
            ), {"hid": self.hotel_id}).fetchone()
            return {
                "hotel_id": self.hotel_id,
                "total_nodes": int(nodes[0]) if nodes else 0,
                "total_edges": int(edges[0]) if edges else 0,
            }
        except Exception:
            return {"hotel_id": self.hotel_id, "total_nodes": 0, "total_edges": 0}
