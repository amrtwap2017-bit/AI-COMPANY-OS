"""
TRIANGLE BLACK — Attention Engine Lifecycle Service
Upgrades Attention from a P0-P3 classifier to an operational control system.

LIFECYCLE:
  DETECTED → ACKNOWLEDGED → ASSIGNED → IN_PROGRESS → RESOLVED → VERIFIED → CLOSED
"""
from __future__ import annotations
from typing import Dict, Any, Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
import uuid


VALID_TRANSITIONS = {
    "DETECTED":     ["ACKNOWLEDGED"],
    "ACKNOWLEDGED": ["ASSIGNED", "DETECTED"],
    "ASSIGNED":     ["IN_PROGRESS", "ACKNOWLEDGED"],
    "IN_PROGRESS":  ["RESOLVED", "ASSIGNED"],
    "RESOLVED":     ["VERIFIED", "IN_PROGRESS"],
    "VERIFIED":     ["CLOSED", "RESOLVED"],
    "CLOSED":       [],
}

VALID_PRIORITIES = ("P0", "P1", "P2", "P3")


class AttentionLifecycleService:
    """
    Manages the complete attention item lifecycle.
    Each P0/P1/P2/P3 item has:
      - owner
      - SLA
      - lifecycle state
      - time tracking
      - escalation
      - audit trail
    """

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def _ensure_table(self):
        """Create attention_items table if not exists."""
        try:
            self.db.execute(text("""
                CREATE TABLE IF NOT EXISTS attention_items (
                    id              VARCHAR(36) PRIMARY KEY,
                    hotel_id        VARCHAR(100) NOT NULL,
                    priority        VARCHAR(4) NOT NULL,
                    title           TEXT NOT NULL,
                    description     TEXT,
                    evidence        TEXT,
                    impact          TEXT,
                    entity_type     VARCHAR(50),
                    entity_id       VARCHAR(36),
                    status          VARCHAR(20) DEFAULT 'DETECTED',
                    owner           VARCHAR(100),
                    deadline        TIMESTAMP,
                    acknowledged_at TIMESTAMP,
                    acknowledged_by VARCHAR(100),
                    assigned_at     TIMESTAMP,
                    assigned_to     VARCHAR(100),
                    resolved_at     TIMESTAMP,
                    resolved_by     VARCHAR(100),
                    resolution      TEXT,
                    verified_at     TIMESTAMP,
                    verified_by     VARCHAR(100),
                    closed_at       TIMESTAMP,
                    closed_by       VARCHAR(100),
                    created_at      TIMESTAMP DEFAULT NOW(),
                    updated_at      TIMESTAMP DEFAULT NOW()
                )
            """))
            self.db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_attention_hotel_status
                ON attention_items(hotel_id, status, priority)
            """))
            self.db.commit()
        except Exception:
            self.db.rollback()

    def create_attention_item(
        self,
        priority: str,
        title: str,
        description: str = "",
        evidence: str = "",
        impact: str = "",
        entity_type: str = None,
        entity_id: str = None,
        owner: str = None,
        deadline: datetime = None,
    ) -> Dict[str, Any]:
        """Create a new attention item in DETECTED state."""
        if priority not in VALID_PRIORITIES:
            return {"success": False, "error": f"Invalid priority: {priority}"}
        self._ensure_table()
        item_id = str(uuid.uuid4())
        now = datetime.utcnow()
        try:
            self.db.execute(text("""
                INSERT INTO attention_items
                (id, hotel_id, priority, title, description, evidence, impact,
                 entity_type, entity_id, status, owner, deadline, created_at, updated_at)
                VALUES (:id, :h, :priority, :title, :desc, :evidence, :impact,
                        :entity_type, :entity_id, 'DETECTED', :owner, :deadline, :now, :now)
            """), {
                "id": item_id, "h": self.hotel_id, "priority": priority,
                "title": title, "desc": description, "evidence": evidence,
                "impact": impact, "entity_type": entity_type, "entity_id": entity_id,
                "owner": owner, "deadline": deadline, "now": now
            })
            self.db.commit()
            return {"success": True, "item_id": item_id, "status": "DETECTED"}
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)[:100]}

    def transition(
        self,
        item_id: str,
        new_status: str,
        actor: str,
        notes: str = "",
        assigned_to: str = None,
        resolution: str = None,
    ) -> Dict[str, Any]:
        """Transition an attention item to a new lifecycle state."""
        self._ensure_table()
        row = self.db.execute(text("""
            SELECT id, hotel_id, priority, status, title
            FROM attention_items WHERE id=:id AND hotel_id=:h
        """), {"id": item_id, "h": self.hotel_id}).fetchone()

        if not row:
            return {"success": False, "error": "Item not found"}

        d = dict(row._mapping)
        current = d["status"]
        allowed = VALID_TRANSITIONS.get(current, [])

        if new_status not in allowed:
            return {
                "success": False,
                "error": f"Cannot transition from {current} to {new_status}. Allowed: {allowed}"
            }

        now = datetime.utcnow()
        updates = {"status": new_status, "updated_at": now}

        if new_status == "ACKNOWLEDGED":
            updates["acknowledged_at"] = now
            updates["acknowledged_by"] = actor
        elif new_status == "ASSIGNED":
            updates["assigned_at"] = now
            updates["assigned_to"] = assigned_to or actor
        elif new_status == "RESOLVED":
            updates["resolved_at"] = now
            updates["resolved_by"] = actor
            updates["resolution"] = resolution
        elif new_status == "VERIFIED":
            updates["verified_at"] = now
            updates["verified_by"] = actor
        elif new_status == "CLOSED":
            updates["closed_at"] = now
            updates["closed_by"] = actor

        set_clauses = ", ".join([f"{k} = :{k}" for k in updates])
        updates["id"] = item_id
        updates["h"] = self.hotel_id

        try:
            self.db.execute(text(f"""
                UPDATE attention_items SET {set_clauses}
                WHERE id = :id AND hotel_id = :h
            """), updates)
            self.db.commit()
            return {
                "success": True, "item_id": item_id,
                "from_status": current, "to_status": new_status,
                "actor": actor, "timestamp": now.isoformat()
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)[:100]}

    def get_open_items(self, priority: str = None) -> Dict[str, Any]:
        """Get attention items that need action."""
        self._ensure_table()
        try:
            sql = """
                SELECT id, priority, title, status, owner, deadline,
                       created_at, acknowledged_at, assigned_at
                FROM attention_items
                WHERE hotel_id = :h AND status NOT IN ('CLOSED', 'VERIFIED')
            """
            params = {"h": self.hotel_id}
            if priority:
                sql += " AND priority = :p"
                params["p"] = priority
            sql += " ORDER BY CASE priority WHEN 'P0' THEN 1 WHEN 'P1' THEN 2 WHEN 'P2' THEN 3 ELSE 4 END, created_at"

            rows = self.db.execute(text(sql), params).fetchall()
            items = [dict(r._mapping) for r in rows]

            # Calculate response time metrics
            summary = {
                "total_open": len(items),
                "by_priority": {},
                "by_status": {},
                "items": items[:20],
            }
            for item in items:
                p = item["priority"]
                s = item["status"]
                summary["by_priority"][p] = summary["by_priority"].get(p, 0) + 1
                summary["by_status"][s] = summary["by_status"].get(s, 0) + 1

            return {"hotel_id": self.hotel_id, **summary}
        except Exception as e:
            return {"error": str(e)[:100], "items": []}

    def get_lifecycle_metrics(self) -> Dict[str, Any]:
        """Performance metrics for the attention lifecycle."""
        self._ensure_table()
        try:
            total = self.db.execute(text(
                "SELECT COUNT(*) FROM attention_items WHERE hotel_id=:h"
            ), {"h": self.hotel_id}).scalar() or 0

            closed = self.db.execute(text(
                "SELECT COUNT(*) FROM attention_items WHERE hotel_id=:h AND status='CLOSED'"
            ), {"h": self.hotel_id}).scalar() or 0

            p0_open = self.db.execute(text(
                "SELECT COUNT(*) FROM attention_items WHERE hotel_id=:h AND priority='P0' AND status NOT IN ('CLOSED','VERIFIED')"
            ), {"h": self.hotel_id}).scalar() or 0

            return {
                "total_created": int(total),
                "total_closed": int(closed),
                "closure_rate_pct": round(closed / max(total, 1) * 100, 1),
                "p0_still_open": int(p0_open),
            }
        except Exception as e:
            return {"error": str(e)[:100]}
