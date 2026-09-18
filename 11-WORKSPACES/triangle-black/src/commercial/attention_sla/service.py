"""
Attention SLA Event Service
Records per-transition timestamps for attention items.
Enables: "Did our P0 response time improve this week vs last week?"

RULE: AI cannot declare SLA improvement without measured timestamps.
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text


class AttentionSLAService:
    """Records and analyzes SLA event timestamps."""

    # SLA targets in minutes per priority
    SLA_TARGETS = {
        "P0": 15, "CRITICAL": 15, "EMERGENCY": 15,
        "P1": 60, "HIGH": 60,
        "P2": 240, "MEDIUM": 240,
        "P3": 1440, "LOW": 1440,
    }

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id
        self._ensure_table()

    def _ensure_table(self):
        """Create SLA events table if not exists."""
        try:
            self.db.execute(text("""
                CREATE TABLE IF NOT EXISTS attention_sla_events (
                    id              VARCHAR(36) PRIMARY KEY,
                    hotel_id        VARCHAR(100) NOT NULL,
                    attention_id    VARCHAR(100),
                    work_order_id   VARCHAR(100),
                    event_type      VARCHAR(50) NOT NULL,
                    priority        VARCHAR(20),
                    occurred_at     TIMESTAMP DEFAULT NOW(),
                    actor           VARCHAR(200),
                    notes           TEXT,
                    sla_target_min  INTEGER,
                    minutes_from_create FLOAT
                )
            """))
            self.db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_sla_events_hotel_type
                ON attention_sla_events(hotel_id, event_type, occurred_at)
            """))
            self.db.commit()
        except Exception:
            self.db.rollback()

    def record_event(
        self,
        event_type: str,
        priority: str = "P2",
        attention_id: Optional[str] = None,
        work_order_id: Optional[str] = None,
        actor: str = "system",
        notes: str = "",
        created_at: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Record an SLA transition event."""
        import uuid
        now = datetime.utcnow()
        event_id = str(uuid.uuid4())
        sla_target = self.SLA_TARGETS.get(priority.upper(), 240)

        # Calculate minutes from creation if created_at provided
        minutes_from_create = None
        if created_at:
            minutes_from_create = round((now - created_at).total_seconds() / 60, 1)

        try:
            self.db.execute(text("""
                INSERT INTO attention_sla_events
                (id, hotel_id, attention_id, work_order_id, event_type,
                 priority, occurred_at, actor, notes, sla_target_min, minutes_from_create)
                VALUES (:id, :h, :attn_id, :wo_id, :event_type,
                        :priority, :now, :actor, :notes, :sla_target, :mins)
            """), {
                "id": event_id, "h": self.hotel_id,
                "attn_id": attention_id, "wo_id": work_order_id,
                "event_type": event_type.upper(),
                "priority": priority.upper(),
                "now": now, "actor": actor, "notes": notes,
                "sla_target": sla_target,
                "mins": minutes_from_create,
            })
            self.db.commit()
            return {
                "success": True,
                "event_id": event_id,
                "event_type": event_type,
                "sla_target_min": sla_target,
                "minutes_from_create": minutes_from_create,
                "sla_breached": (minutes_from_create or 0) > sla_target,
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)[:150]}

    def get_sla_summary(self, days: int = 30) -> Dict[str, Any]:
        """
        SLA performance summary for last N days.
        Returns avg response times by priority — the KEY pilot KPI.
        """
        try:
            rows = self.db.execute(text("""
                SELECT
                    priority,
                    event_type,
                    COUNT(*) as event_count,
                    ROUND(AVG(minutes_from_create)::numeric, 1) as avg_minutes,
                    ROUND(MIN(minutes_from_create)::numeric, 1) as min_minutes,
                    ROUND(MAX(minutes_from_create)::numeric, 1) as max_minutes,
                    COUNT(CASE WHEN minutes_from_create > sla_target_min THEN 1 END) as breached_count
                FROM attention_sla_events
                WHERE hotel_id = :h
                AND occurred_at >= NOW() - INTERVAL ':days days'
                AND minutes_from_create IS NOT NULL
                GROUP BY priority, event_type
                ORDER BY priority, event_type
            """), {"h": self.hotel_id, "days": days}).fetchall()

            summary = {}
            for row in rows:
                d = dict(row._mapping)
                priority = d["priority"]
                event_type = d["event_type"]
                if priority not in summary:
                    sla_target = self.SLA_TARGETS.get(priority, 240)
                    summary[priority] = {"sla_target_min": sla_target, "events": {}}
                summary[priority]["events"][event_type] = {
                    "count": int(d["event_count"]),
                    "avg_minutes": float(d["avg_minutes"] or 0),
                    "min_minutes": float(d["min_minutes"] or 0),
                    "max_minutes": float(d["max_minutes"] or 0),
                    "breach_count": int(d["breached_count"]),
                    "breach_rate_pct": round(
                        int(d["breached_count"]) / max(int(d["event_count"]), 1) * 100, 1
                    ),
                }

            return {
                "hotel_id": self.hotel_id,
                "period_days": days,
                "by_priority": summary,
                "generated_at": datetime.utcnow().isoformat(),
                "interpretation": "Lower avg_minutes = faster response = better SLA",
            }
        except Exception as e:
            return {"error": str(e)[:150], "hotel_id": self.hotel_id}
