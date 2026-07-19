"""
app/learning/insight_store.py
────────────────────────────────────────────────────────────────
Persists learning insights to the database.
Retrieves insights for API consumption.
"""

from __future__ import annotations

import logging
from sqlalchemy.orm import Session

from app.learning.models import LearningInsight
from app.models.db.learning_insight import LearningInsightRecord

log = logging.getLogger(__name__)


class InsightStore:

    def __init__(self, db: Session) -> None:
        self._db = db

    def save_all(self, insights: list[LearningInsight]) -> int:
        """Save a list of insights. Returns count saved."""
        saved = 0
        for insight in insights:
            try:
                record = LearningInsightRecord(
                    insight_type=insight.insight_type.value,
                    agent_name=insight.agent_name,
                    model=insight.model,
                    title=insight.title,
                    description=insight.description,
                    recommendation=insight.recommendation,
                    evidence=insight.evidence,
                    confidence=insight.confidence,
                    priority=insight.priority,
                )
                self._db.add(record)
                saved += 1
            except Exception as exc:
                log.debug("Insight save failed: %s", exc)

        if saved:
            self._db.commit()

        return saved

    def get_recent(
        self,
        limit: int = 20,
        insight_type: str | None = None,
        agent_name: str | None = None,
        min_priority: int | None = None,
    ) -> list[LearningInsightRecord]:
        q = self._db.query(LearningInsightRecord)
        if insight_type:
            q = q.filter(LearningInsightRecord.insight_type == insight_type)
        if agent_name:
            q = q.filter(LearningInsightRecord.agent_name == agent_name)
        if min_priority:
            q = q.filter(LearningInsightRecord.priority <= min_priority)
        return (
            q.order_by(
                LearningInsightRecord.priority.asc(),
                LearningInsightRecord.created_at.desc(),
            )
            .limit(limit)
            .all()
        )

    def get_actionable(self, limit: int = 10) -> list[LearningInsightRecord]:
        """Return high-priority unactioned insights."""
        return (
            self._db.query(LearningInsightRecord)
            .filter(
                LearningInsightRecord.priority <= 2,
                LearningInsightRecord.applied == False,  # noqa: E712
            )
            .order_by(
                LearningInsightRecord.priority.asc(),
                LearningInsightRecord.created_at.desc(),
            )
            .limit(limit)
            .all()
        )

    def mark_applied(self, insight_id: int) -> bool:
        record = self._db.query(LearningInsightRecord).filter(
            LearningInsightRecord.id == insight_id
        ).first()
        if not record:
            return False
        record.applied = True
        self._db.commit()
        return True

    def count_by_type(self) -> dict[str, int]:
        from sqlalchemy import func
        rows = (
            self._db.query(
                LearningInsightRecord.insight_type,
                func.count(LearningInsightRecord.id).label("count"),
            )
            .group_by(LearningInsightRecord.insight_type)
            .all()
        )
        return {r.insight_type: r.count for r in rows}
