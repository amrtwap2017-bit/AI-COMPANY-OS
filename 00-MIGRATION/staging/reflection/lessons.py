"""
app/reflection/lessons.py
────────────────────────────────────────────────────────────────
Takes reflection results and saves lessons to memory.

Every failure becomes a persistent memory.
Every slow execution becomes a persistent memory.
The agent learns from its own history.
"""

from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from app.reflection.models import ReflectionResult
from app.memory.service import MemoryService, MemorySaveRequest

log = logging.getLogger(__name__)


class LessonExtractor:

    def __init__(self, db: Session) -> None:
        self._memory = MemoryService(db)

    def save_lessons(self, result: ReflectionResult) -> int:
        """
        Save lessons from a reflection result into agent memory.
        Returns the number of lessons saved.
        """
        if not result.should_remember:
            return 0
        if not result.lessons:
            return 0

        saved = 0
        for lesson in result.lessons:
            memory_type = self._classify_lesson(result)
            importance = self._score_importance(result)

            self._memory.save(MemorySaveRequest(
                agent_name=result.execution.agent_name,
                content=lesson,
                memory_type=memory_type,
                importance=importance,
                extra_data={
                    "source": "reflection",
                    "task": result.execution.task[:200],
                    "quality_score": result.quality_score,
                    "speed_rating": result.speed_rating,
                    "success": result.success,
                },
            ))
            saved += 1

        log.debug(
            "Saved %d lessons for agent %s",
            saved, result.execution.agent_name,
        )
        return saved

    def _classify_lesson(self, result: ReflectionResult) -> str:
        """Decide memory type based on lesson significance."""
        if not result.success:
            return "long_term"
        if result.quality_score < 0.5:
            return "long_term"
        return "short_term"

    def _score_importance(self, result: ReflectionResult) -> float:
        """Higher importance for failures and slow executions."""
        if not result.success:
            return 0.9
        if result.speed_rating == "slow":
            return 0.75
        if result.quality_score < 0.5:
            return 0.7
        return 0.5
