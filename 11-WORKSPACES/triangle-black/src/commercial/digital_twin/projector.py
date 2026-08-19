"""
T-011: Digital Twin Event Projector
Builds graph projections from domain events via outbox.

Architecture:
  Domain Event (outbox) → Projector → twin_nodes + twin_edges

The Digital Twin is a READ projection — never a source of truth.
Source of truth remains: work_orders, assets, service_requests, etc.

Graph model:
  Nodes: Asset, WorkOrder, Technician, Supplier, Contract, Site
  Edges: HAS_WORK_ORDER, ASSIGNED_TO, SUPPLIED_BY, UNDER_CONTRACT
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
import json


class DigitalTwinProjector:
    """
    Projects domain events into the Digital Twin graph.
    Called by the outbox dispatcher when events are processed.
    """

    NODE_TYPES = {
        "asset", "work_order", "technician",
        "supplier", "contract", "site", "service_request"
    }

    EDGE_TYPES = {
        "HAS_WORK_ORDER",      # asset → work_order
        "ASSIGNED_TO",          # work_order → technician
        "SUPPLIED_BY",          # work_order → supplier
        "UNDER_CONTRACT",       # asset → contract
        "LOCATED_AT",           # asset → site
        "GENERATED_FROM",       # work_order → service_request
    }

    def __init__(self, db, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def project_event(self, event: Dict[str, Any]) -> bool:
        """
        Project a single domain event into the twin graph.
        Returns True if projection was created/updated.
        """
        event_type = event.get("event_type", "")
        payload = event.get("payload", {})
        if isinstance(payload, str):
            try:
                payload = json.loads(payload)
            except Exception:
                payload = {}

        handlers = {
            "WO_CREATED": self._project_wo_created,
            "WO_ASSIGNED": self._project_wo_assigned,
            "WO_COMPLETED": self._project_wo_completed,
            "WO_CLOSED": self._project_wo_closed,
            "SR_WO_GENERATED": self._project_sr_wo_generated,
            "ASSET_CREATED": self._project_asset_created,
            "ASSET_FAULT": self._project_asset_fault,
            "ASSET_REPAIRED": self._project_asset_repaired,
        }

        handler = handlers.get(event_type)
        if handler:
            try:
                handler(payload, event)
                return True
            except Exception:
                return False
        return False

    def _project_wo_created(self, payload: Dict, event: Dict) -> None:
        """WO created → upsert WO node, link to asset if present."""
        wo_id = payload.get("entity_id") or event.get("entity_id")
        if not wo_id:
            return

        self._upsert_node(
            node_id=wo_id,
            node_type="work_order",
            label=payload.get("title", "Work Order"),
            properties={
                "status": "open",
                "priority": payload.get("priority", "medium"),
                "sla_hours": payload.get("sla_hours", 24),
            }
        )

        # Link to asset if present
        asset_id = payload.get("asset_id")
        if asset_id:
            self._upsert_edge(
                from_id=asset_id,
                from_type="asset",
                to_id=wo_id,
                to_type="work_order",
                edge_type="HAS_WORK_ORDER",
                properties={"created_at": event.get("created_at")}
            )

    def _project_wo_assigned(self, payload: Dict, event: Dict) -> None:
        """WO assigned → update WO node + link to technician."""
        wo_id = event.get("entity_id")
        tech_id = payload.get("technician_id")
        if not wo_id:
            return

        self._upsert_node(wo_id, "work_order", properties={"status": "assigned"})

        if tech_id:
            self._upsert_edge(
                from_id=wo_id, from_type="work_order",
                to_id=tech_id, to_type="technician",
                edge_type="ASSIGNED_TO",
                properties={}
            )

    def _project_wo_completed(self, payload: Dict, event: Dict) -> None:
        """WO completed → update node status + SLA."""
        wo_id = event.get("entity_id")
        if wo_id:
            self._upsert_node(wo_id, "work_order", properties={
                "status": "completed",
                "sla_status": payload.get("sla_status", "unknown"),
            })

    def _project_wo_closed(self, payload: Dict, event: Dict) -> None:
        """WO closed → final status update."""
        wo_id = event.get("entity_id")
        if wo_id:
            self._upsert_node(wo_id, "work_order", properties={"status": "closed"})

    def _project_sr_wo_generated(self, payload: Dict, event: Dict) -> None:
        """SR generated WO → link SR to WO."""
        sr_id = event.get("entity_id")
        wo_id = payload.get("work_order_id")
        if sr_id and wo_id:
            self._upsert_node(sr_id, "service_request")
            self._upsert_edge(
                from_id=wo_id, from_type="work_order",
                to_id=sr_id, to_type="service_request",
                edge_type="GENERATED_FROM",
                properties={}
            )

    def _project_asset_created(self, payload: Dict, event: Dict) -> None:
        """Asset created → upsert asset node."""
        asset_id = event.get("entity_id")
        if asset_id:
            self._upsert_node(
                node_id=asset_id,
                node_type="asset",
                label=payload.get("name", "Asset"),
                properties={
                    "category": payload.get("category"),
                    "status": "active",
                    "criticality": payload.get("criticality", "medium"),
                }
            )

    def _project_asset_fault(self, payload: Dict, event: Dict) -> None:
        """Asset fault → update status to fault."""
        asset_id = event.get("entity_id")
        if asset_id:
            self._upsert_node(asset_id, "asset", properties={"status": "fault"})

    def _project_asset_repaired(self, payload: Dict, event: Dict) -> None:
        """Asset repaired → update status to operational."""
        asset_id = event.get("entity_id")
        if asset_id:
            self._upsert_node(asset_id, "asset", properties={"status": "active"})

    def _upsert_node(
        self,
        node_id: str,
        node_type: str,
        label: Optional[str] = None,
        properties: Optional[Dict] = None,
    ) -> None:
        """Create or update a twin graph node."""
        from sqlalchemy import text as _text

        try:
            existing = self.db.execute(_text("""
                SELECT id, properties FROM twin_nodes
                WHERE id = :id AND hotel_id = :hid
            """), {"id": node_id, "hid": self.hotel_id}).fetchone()

            if existing:
                # Merge properties
                current = existing[1] or {}
                if isinstance(current, str):
                    current = json.loads(current)
                merged = {**current, **(properties or {})}
                self.db.execute(_text("""
                    UPDATE twin_nodes
                    SET properties = :props::jsonb,
                        label = COALESCE(:label, label),
                        updated_at = :now
                    WHERE id = :id AND hotel_id = :hid
                """), {
                    "props": json.dumps(merged),
                    "label": label,
                    "now": datetime.utcnow(),
                    "id": node_id,
                    "hid": self.hotel_id,
                })
            else:
                self.db.execute(_text("""
                    INSERT INTO twin_nodes
                        (id, hotel_id, node_type, label, properties,
                         source_ref, created_at, updated_at)
                    VALUES
                        (:id, :hid, :type, :label, :props::jsonb,
                         :source_ref, :now, :now)
                """), {
                    "id": node_id,
                    "hid": self.hotel_id,
                    "type": node_type,
                    "label": label or node_type,
                    "props": json.dumps(properties or {}),
                    "source_ref": f"{node_type}:{node_id}",
                    "now": datetime.utcnow(),
                })
            self.db.commit()
        except Exception:
            self.db.rollback()

    def _upsert_edge(
        self,
        from_id: str,
        from_type: str,
        to_id: str,
        to_type: str,
        edge_type: str,
        properties: Optional[Dict] = None,
    ) -> None:
        """Create or update a twin graph edge."""
        from sqlalchemy import text as _text

        # Ensure both nodes exist
        self._upsert_node(from_id, from_type)
        self._upsert_node(to_id, to_type)

        edge_id = f"{from_id}:{edge_type}:{to_id}"

        try:
            self.db.execute(_text("""
                INSERT INTO twin_edges
                    (id, hotel_id, from_node_id, to_node_id,
                     edge_type, properties, created_at)
                VALUES
                    (:id, :hid, :from_id, :to_id,
                     :edge_type, :props::jsonb, :now)
                ON CONFLICT (id) DO UPDATE
                    SET properties = :props::jsonb
            """), {
                "id": edge_id,
                "hid": self.hotel_id,
                "from_id": from_id,
                "to_id": to_id,
                "edge_type": edge_type,
                "props": json.dumps(properties or {}),
                "now": datetime.utcnow(),
            })
            self.db.commit()
        except Exception:
            self.db.rollback()

    def get_node_impact(self, entity_type: str, entity_id: str) -> Dict[str, Any]:
        """
        Return all entities connected to this node.
        Used for impact analysis: which WOs affect this asset?
        """
        from sqlalchemy import text as _text

        try:
            # Direct connections
            edges = self.db.execute(_text("""
                SELECT
                    e.from_node_id, e.to_node_id, e.edge_type,
                    n1.node_type as from_type, n1.label as from_label,
                    n2.node_type as to_type, n2.label as to_label
                FROM twin_edges e
                JOIN twin_nodes n1 ON e.from_node_id = n1.id
                JOIN twin_nodes n2 ON e.to_node_id = n2.id
                WHERE e.hotel_id = :hid
                AND (e.from_node_id = :id OR e.to_node_id = :id)
                LIMIT 50
            """), {"hid": self.hotel_id, "id": entity_id}).fetchall()

            return {
                "entity_id": entity_id,
                "entity_type": entity_type,
                "hotel_id": self.hotel_id,
                "connections": [dict(r._mapping) for r in edges],
                "connection_count": len(edges),
                "generated_at": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            return {
                "entity_id": entity_id,
                "entity_type": entity_type,
                "hotel_id": self.hotel_id,
                "connections": [],
                "connection_count": 0,
                "error": str(e),
            }

    def project_from_existing_data(self) -> Dict[str, Any]:
        """
        Bootstrap the twin from existing OLTP data.
        Called once to seed the twin from current state.
        """
        from sqlalchemy import text as _text

        counts = {"assets": 0, "work_orders": 0, "edges": 0}

        # Project assets
        try:
            rows = self.db.execute(_text("""
                SELECT id, name, category, status, criticality
                FROM assets WHERE hotel_id = :hid LIMIT 200
            """), {"hid": self.hotel_id}).fetchall()

            for row in rows:
                d = dict(row._mapping)
                self._upsert_node(
                    d["id"], "asset", label=d.get("name"),
                    properties={"category": d.get("category"), "status": d.get("status")}
                )
                counts["assets"] += 1
        except Exception:
            pass

        # Project work orders
        try:
            rows = self.db.execute(_text("""
                SELECT id, title, status, priority, type,
                       asset_id, technician_id
                FROM work_orders
                WHERE hotel_id = :hid
                AND (deleted_at IS NULL OR deleted_at > NOW())
                LIMIT 200
            """), {"hid": self.hotel_id}).fetchall()

            for row in rows:
                d = dict(row._mapping)
                self._upsert_node(
                    d["id"], "work_order", label=d.get("title"),
                    properties={"status": d.get("status"), "priority": d.get("priority")}
                )
                counts["work_orders"] += 1

                if d.get("asset_id"):
                    self._upsert_edge(
                        d["asset_id"], "asset",
                        d["id"], "work_order",
                        "HAS_WORK_ORDER", {}
                    )
                    counts["edges"] += 1

                if d.get("technician_id"):
                    self._upsert_edge(
                        d["id"], "work_order",
                        d["technician_id"], "technician",
                        "ASSIGNED_TO", {}
                    )
                    counts["edges"] += 1
        except Exception:
            pass

        return {
            "hotel_id": self.hotel_id,
            "projected": counts,
            "generated_at": datetime.utcnow().isoformat(),
        }
