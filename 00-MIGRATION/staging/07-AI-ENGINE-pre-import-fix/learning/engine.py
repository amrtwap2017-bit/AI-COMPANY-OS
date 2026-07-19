"""
app/learning/engine.py
────────────────────────────────────────────────────────────────
Orchestrates the full learning pipeline.

Pipeline:
  1. Analyze model performance from reflections
  2. Analyze prompt quality from decisions + reflections
  3. Generate actionable insights
  4. Save insights to DB
  5. Optionally: apply model preference to agent registry
  6. Return LearningReport

Runs fully from stored DB data.
Zero LLM calls. Zero cost. Fast.
"""

from __future__ import annotations

import logging
from sqlalchemy.orm import Session

from app.learning.models import LearningReport
from app.learning.analyzer import ReflectionAnalyzer
from app.learning.insight_store import InsightStore

log = logging.getLogger(__name__)


class LearningEngine:

    def __init__(self, db: Session) -> None:
        self._db       = db
        self._analyzer = ReflectionAnalyzer(db)
        self._store    = InsightStore(db)

    def run(self) -> LearningReport:
        """
        Run the full learning pipeline.
        Returns a LearningReport with all findings.
        """
        log.info("Learning Engine: starting analysis run")

        # 1. Analyze model performance
        model_rankings = self._analyzer.analyze_model_performance()
        log.info("Model rankings: %d entries", len(model_rankings))

        # 2. Analyze prompt quality
        prompt_scores = self._analyzer.analyze_prompt_quality()
        log.info("Prompt scores: %d entries", len(prompt_scores))

        # 3. Generate insights
        insights = self._analyzer.generate_insights(model_rankings, prompt_scores)
        log.info("Insights generated: %d", len(insights))

        # 4. Save insights
        saved = self._store.save_all(insights)
        log.info("Insights saved: %d", saved)

        # 5. Build summary
        total_data = (
            self._count_reflections() +
            self._count_decisions()
        )

        summary = self._build_summary(
            model_rankings, prompt_scores, insights, total_data
        )

        return LearningReport(
            model_rankings=model_rankings,
            prompt_scores=prompt_scores,
            insights=insights,
            total_analyzed=total_data,
            summary=summary,
        )

    def get_insights(
        self,
        limit: int = 20,
        insight_type: str | None = None,
        agent_name: str | None = None,
        min_priority: int | None = None,
    ) -> list:
        return self._store.get_recent(
            limit=limit,
            insight_type=insight_type,
            agent_name=agent_name,
            min_priority=min_priority,
        )

    def get_actionable(self, limit: int = 10) -> list:
        return self._store.get_actionable(limit=limit)

    def mark_applied(self, insight_id: int) -> bool:
        return self._store.mark_applied(insight_id)

    def get_model_recommendations(self) -> list[dict]:
        """
        Return current model recommendations for all agents.
        Used by orchestrator to select best model.
        """
        rankings = self._analyzer.analyze_model_performance()
        result: dict[str, dict] = {}

        for r in rankings:
            key = r.agent_name
            if key not in result:
                result[key] = {
                    "agent":          r.agent_name,
                    "best_model":     r.model,
                    "recommendation": r.recommendation,
                    "avg_quality":    r.avg_quality,
                    "avg_duration_s": r.avg_duration,
                    "samples":        r.sample_count,
                }
            elif r.avg_quality > result[key]["avg_quality"]:
                result[key]["best_model"]     = r.model
                result[key]["recommendation"] = r.recommendation
                result[key]["avg_quality"]    = r.avg_quality

        return list(result.values())

    def get_insight_summary(self) -> dict:
        """High-level summary of all learning data."""
        by_type = self._store.count_by_type()
        actionable = self._store.get_actionable(limit=100)

        return {
            "total_insights":    sum(by_type.values()),
            "by_type":           by_type,
            "actionable_count":  len(actionable),
            "reflections_analyzed": self._count_reflections(),
            "decisions_analyzed":   self._count_decisions(),
        }

    def _count_reflections(self) -> int:
        from app.models.db.reflection import Reflection
        return self._db.query(Reflection).count()

    def _count_decisions(self) -> int:
        from app.models.db.decision import DecisionRecord
        return self._db.query(DecisionRecord).count()

    def _build_summary(
        self,
        model_rankings,
        prompt_scores,
        insights,
        total_data: int,
    ) -> str:
        priority_1 = sum(1 for i in insights if i.priority == 1)
        priority_2 = sum(1 for i in insights if i.priority == 2)

        lines = [
            f"Learning Engine analyzed {total_data} data points.",
            f"Found {len(insights)} insights "
            f"({priority_1} urgent, {priority_2} high priority).",
        ]

        if model_rankings:
            best = model_rankings[0]
            lines.append(
                f"Best performing: {best.model!r} for {best.agent_name} "
                f"(quality={best.avg_quality:.2f})."
            )

        urgent = [i for i in insights if i.priority == 1]
        if urgent:
            lines.append(f"Urgent: {urgent[0].title}")

        return " ".join(lines)
