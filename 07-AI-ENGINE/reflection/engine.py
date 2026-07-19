"""
app/reflection/engine.py
────────────────────────────────────────────────────────────────
Orchestrates the full reflection pipeline:
  1. Analyze execution result
  2. Save reflection to database
  3. Extract and save lessons to memory
  4. Track analytics event

This is the single entry point. Call reflect() after any execution.
"""

from __future__ import annotations

import logging

from sqlalchemy import func, Integer
from sqlalchemy.orm import Session

from reflection.models import ExecutionRecord, ReflectionResult
from reflection.analyzer import ReflectionAnalyzer
from reflection.lessons import LessonExtractor
from models.db.reflection import Reflection
from analytics.tracker import track

log = logging.getLogger(__name__)


class ReflectionEngine:

    def __init__(
        self,
        db: Session,
        analyzer: ReflectionAnalyzer | None = None,
    ) -> None:
        self._db       = db
        self._analyzer = analyzer or ReflectionAnalyzer()
        self._lessons  = LessonExtractor(db)

    def reflect(self, execution: ExecutionRecord) -> ReflectionResult:
        """
        Full reflection pipeline. Call after every significant execution.
        Never raises — reflection must not break the main flow.
        """
        try:
            result = self._analyzer.analyze(execution)
            self._save_to_db(result)
            self._lessons.save_lessons(result)
            self._track_event(result)
            return result
        except Exception as exc:
            log.error("Reflection failed: %s", exc)
            return ReflectionResult(
                execution=execution,
                success=execution.status == "success",
                quality_score=0.0,
                speed_rating="unknown",
                lessons=[],
                improvements=[],
                should_remember=False,
            )

    def get_reflections(
        self,
        agent_name: str | None = None,
        limit: int = 20,
    ) -> list[Reflection]:
        """Query stored reflections from the database."""
        q = self._db.query(Reflection)
        if agent_name:
            q = q.filter(Reflection.agent_name == agent_name)
        return (
            q.order_by(Reflection.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_failure_patterns(
        self,
        agent_name: str | None = None,
        limit: int = 10,
    ) -> list[Reflection]:
        """Get recent failures for pattern analysis."""
        q = self._db.query(Reflection).filter(
            Reflection.success == False  # noqa: E712
        )
        if agent_name:
            q = q.filter(Reflection.agent_name == agent_name)
        return (
            q.order_by(Reflection.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_agent_quality(self, agent_name: str) -> dict:
        """Return average quality metrics for an agent."""
        row = (
            self._db.query(
                func.count(Reflection.id).label("total"),
                func.avg(Reflection.quality_score).label("avg_quality"),
                func.avg(Reflection.duration_seconds).label("avg_duration"),
                func.sum(
                    func.cast(Reflection.success, Integer)
                ).label("success_count"),
            )
            .filter(Reflection.agent_name == agent_name)
            .one()
        )
        total = row.total or 0
        return {
            "agent": agent_name,
            "total_reflections": total,
            "avg_quality": (
                round(float(row.avg_quality), 3) if row.avg_quality else None
            ),
            "avg_duration": (
                round(float(row.avg_duration), 2) if row.avg_duration else None
            ),
            "success_rate": (
                round(int(row.success_count or 0) / total * 100, 1)
                if total else 0.0
            ),
        }

    def _save_to_db(self, result: ReflectionResult) -> None:
        """Persist reflection to the reflections table."""
        ref = Reflection(
            agent_name=result.execution.agent_name,
            model_used=result.execution.model_used,
            task=result.execution.task,
            status=result.execution.status,
            success=result.success,
            quality_score=result.quality_score,
            speed_rating=result.speed_rating,
            failure_reason=result.failure_reason,
            lessons=result.lessons,
            improvements=result.improvements,
            duration_seconds=result.execution.duration_seconds,
            project_id=result.execution.project_id,
            conversation_id=result.execution.conversation_id,
        )
        self._db.add(ref)
        self._db.commit()

    def _track_event(self, result: ReflectionResult) -> None:
        """Fire analytics event for this reflection."""
        track(
            "reflection",
            agent_name=result.execution.agent_name,
            model_used=result.execution.model_used,
            status="success" if result.success else "failed",
            duration_seconds=result.execution.duration_seconds,
            extra_data={
                "quality_score": result.quality_score,
                "speed_rating": result.speed_rating,
                "lessons_count": len(result.lessons),
                "failure_reason": result.failure_reason,
            },
        )
