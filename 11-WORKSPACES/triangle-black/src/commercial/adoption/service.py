"""
Customer Adoption Intelligence Service
Tracks how engineers actually use the system during the V15 pilot.

STRATEGIC IMPORTANCE:
  If engineers don't use the system, intelligence is worthless.
  This answers: "Are they coming back? What are they doing?"

KEY METRICS:
  logins_last_7d       — is the team logging in?
  wos_created_7d       — are they creating real work orders?
  recs_reviewed_7d     — are they looking at recommendations?
  recs_approved_7d     — are they acting on AI insights?
  outcomes_recorded_7d — are they closing the loop?

ADOPTION HEALTH SCORE:
  0-20:  Not adopted (serious pilot risk)
  21-50: Low adoption (needs intervention)
  51-75: Moderate (on track)
  76-100: Strong adoption (pilot succeeding)
"""
from __future__ import annotations
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text


class AdoptionService:
    """Measures and reports customer adoption health."""

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id
        self._ensure_table()

    def _ensure_table(self):
        """Create adoption_events table if not exists."""
        try:
            self.db.execute(text("""
                CREATE TABLE IF NOT EXISTS adoption_events (
                    id          VARCHAR(36) PRIMARY KEY,
                    hotel_id    VARCHAR(100) NOT NULL,
                    user_id     VARCHAR(100),
                    event_type  VARCHAR(50) NOT NULL,
                    entity_type VARCHAR(50),
                    entity_id   VARCHAR(100),
                    occurred_at TIMESTAMP DEFAULT NOW(),
                    metadata    TEXT
                )
            """))
            self.db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_adoption_hotel_type_time
                ON adoption_events(hotel_id, event_type, occurred_at)
            """))
            self.db.commit()
        except Exception:
            self.db.rollback()

    def record_event(
        self,
        event_type: str,
        user_id: Optional[str] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        metadata: Optional[str] = None,
    ) -> bool:
        """Record an adoption event (non-blocking — never fail user operations)."""
        try:
            import uuid
            self.db.execute(text("""
                INSERT INTO adoption_events
                (id, hotel_id, user_id, event_type, entity_type, entity_id, metadata)
                VALUES (:id, :h, :uid, :event, :etype, :eid, :meta)
            """), {
                "id": str(uuid.uuid4()), "h": self.hotel_id,
                "uid": user_id, "event": event_type.upper(),
                "etype": entity_type, "eid": entity_id, "meta": metadata,
            })
            self.db.commit()
            return True
        except Exception:
            try: self.db.rollback()
            except Exception: pass
            return False

    def get_adoption_health(self, days: int = 7) -> Dict[str, Any]:
        """
        Compute adoption health score for the last N days.
        Returns a score 0-100 and breakdown by activity type.
        """
        try:
            result = self.db.execute(text("""
                SELECT
                    event_type,
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(*) as event_count
                FROM adoption_events
                WHERE hotel_id = :h
                AND occurred_at >= NOW() - INTERVAL ':days days'
                GROUP BY event_type
            """), {"h": self.hotel_id, "days": days}).fetchall()

            events: Dict[str, Dict] = {}
            for row in result:
                d = dict(row._mapping)
                events[d["event_type"]] = {
                    "unique_users": int(d["unique_users"]),
                    "event_count": int(d["event_count"]),
                }

            # Also count total distinct active users
            active_users = self.db.execute(text("""
                SELECT COUNT(DISTINCT user_id) as active_users
                FROM adoption_events
                WHERE hotel_id = :h
                AND occurred_at >= NOW() - INTERVAL ':days days'
                AND user_id IS NOT NULL
            """), {"h": self.hotel_id, "days": days}).scalar() or 0

            # Compute health score
            score = self._compute_score(events, int(active_users))

            return {
                "hotel_id": self.hotel_id,
                "period_days": days,
                "active_users": int(active_users),
                "health_score": score,
                "health_label": self._score_label(score),
                "by_event": events,
                "generated_at": datetime.utcnow().isoformat(),
                "interpretation": {
                    "76-100": "Strong adoption — pilot succeeding",
                    "51-75": "Moderate — on track",
                    "21-50": "Low adoption — needs intervention",
                    "0-20": "Not adopted — serious pilot risk",
                }[self._score_band(score)],
            }
        except Exception as e:
            return {
                "hotel_id": self.hotel_id,
                "error": str(e)[:150],
                "health_score": 0,
                "active_users": 0,
            }

    def _compute_score(self, events: dict, active_users: int) -> int:
        """Score 0-100 based on adoption signals."""
        score = 0

        # Active users (max 30 points)
        if active_users >= 5: score += 30
        elif active_users >= 3: score += 20
        elif active_users >= 1: score += 10

        # Work orders created (max 20 points)
        wo_count = events.get("WO_CREATED", {}).get("event_count", 0)
        if wo_count >= 10: score += 20
        elif wo_count >= 5: score += 10
        elif wo_count >= 1: score += 5

        # Recommendations reviewed (max 20 points)
        rec_views = events.get("REC_VIEWED", {}).get("event_count", 0)
        if rec_views >= 10: score += 20
        elif rec_views >= 3: score += 10
        elif rec_views >= 1: score += 5

        # Recommendations approved (max 20 points)
        rec_approved = events.get("REC_APPROVED", {}).get("event_count", 0)
        if rec_approved >= 5: score += 20
        elif rec_approved >= 2: score += 10
        elif rec_approved >= 1: score += 5

        # Outcomes recorded (max 10 points)
        outcomes = events.get("OUTCOME_RECORDED", {}).get("event_count", 0)
        if outcomes >= 3: score += 10
        elif outcomes >= 1: score += 5

        return min(score, 100)

    def _score_label(self, score: int) -> str:
        if score >= 76: return "STRONG"
        if score >= 51: return "MODERATE"
        if score >= 21: return "LOW"
        return "NOT_ADOPTED"

    def _score_band(self, score: int) -> str:
        if score >= 76: return "76-100"
        if score >= 51: return "51-75"
        if score >= 21: return "21-50"
        return "0-20"
