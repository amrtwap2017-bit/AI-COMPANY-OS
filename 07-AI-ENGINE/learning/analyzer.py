"""
app/learning/analyzer.py
────────────────────────────────────────────────────────────────
Reads stored reflections, decisions, and analytics events.
Finds patterns and produces LearningInsight objects.

Runs entirely from existing DB data — no LLM calls.
Fast, deterministic, zero inference cost.
"""

from __future__ import annotations

import logging
from collections import defaultdict
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer

from learning.models import (
    LearningInsight, InsightType, ModelRanking, PromptScore
)
from models.db.reflection import Reflection
from models.db.decision import DecisionRecord

log = logging.getLogger(__name__)

# Thresholds
MIN_SAMPLES          = 2     # minimum data points to generate insight
SLOW_THRESHOLD_S     = 120   # seconds — flagged as slow
FAST_THRESHOLD_S     = 15    # seconds — flagged as fast
LOW_QUALITY          = 0.5   # quality score below this = concern
HIGH_REJECTION_RATE  = 0.4   # >40% decisions rejected = prompt issue
LOW_SUCCESS_RATE     = 0.6   # <60% success rate = agent issue


class ReflectionAnalyzer:

    def __init__(self, db: Session) -> None:
        self._db = db

    def analyze_model_performance(self) -> list[ModelRanking]:
        """
        Rank models by performance per agent using reflection data.
        """
        rows = (
            self._db.query(
                Reflection.agent_name,
                Reflection.model_used,
                func.count(Reflection.id).label("count"),
                func.avg(Reflection.quality_score).label("avg_quality"),
                func.avg(Reflection.duration_seconds).label("avg_duration"),
                func.sum(
                    func.cast(Reflection.success == True, Integer)
                ).label("successes"),
            )
            .filter(
                Reflection.model_used.isnot(None),
                Reflection.agent_name.isnot(None),
            )
            .group_by(Reflection.agent_name, Reflection.model_used)
            .having(func.count(Reflection.id) >= MIN_SAMPLES)
            .all()
        )

        rankings: list[ModelRanking] = []

        for row in rows:
            count      = row.count or 1
            successes  = int(row.successes or 0)
            success_rate = successes / count
            avg_quality  = float(row.avg_quality or 0)
            avg_duration = float(row.avg_duration or 0)

            if avg_quality >= 0.7 and success_rate >= 0.8:
                recommendation = "use"
            elif avg_quality < 0.4 or success_rate < 0.5:
                recommendation = "avoid"
            elif avg_duration < FAST_THRESHOLD_S:
                recommendation = "prefer_for_simple"
            else:
                recommendation = "use"

            rankings.append(ModelRanking(
                agent_name=row.agent_name,
                model=row.model_used,
                avg_quality=round(avg_quality, 3),
                avg_duration=round(avg_duration, 2),
                success_rate=round(success_rate, 3),
                sample_count=count,
                recommendation=recommendation,
            ))

        return sorted(rankings, key=lambda r: r.avg_quality, reverse=True)

    def analyze_prompt_quality(self) -> list[PromptScore]:
        """
        Score each agent's prompt by correlating outputs with decisions.
        """
        # Get decision stats per agent
        decision_rows = (
            self._db.query(
                DecisionRecord.agent_name,
                func.count(DecisionRecord.id).label("total"),
                func.avg(DecisionRecord.confidence).label("avg_confidence"),
                func.sum(
                    func.cast(
                        DecisionRecord.verdict.in_(["retry", "review"]),
                        Integer,
                    )
                ).label("rejections"),
            )
            .filter(DecisionRecord.agent_name.isnot(None))
            .group_by(DecisionRecord.agent_name)
            .having(func.count(DecisionRecord.id) >= MIN_SAMPLES)
            .all()
        )

        # Get reflection quality per agent
        reflection_rows = (
            self._db.query(
                Reflection.agent_name,
                func.avg(Reflection.quality_score).label("avg_quality"),
            )
            .filter(Reflection.agent_name.isnot(None))
            .group_by(Reflection.agent_name)
            .all()
        )
        quality_by_agent = {
            r.agent_name: float(r.avg_quality or 0)
            for r in reflection_rows
        }

        scores: list[PromptScore] = []

        for row in decision_rows:
            total       = row.total or 1
            rejections  = int(row.rejections or 0)
            rejection_rate  = rejections / total
            avg_confidence  = float(row.avg_confidence or 0)
            avg_quality     = quality_by_agent.get(row.agent_name, 0)

            hint = self._generate_prompt_hint(
                agent_name=row.agent_name,
                avg_quality=avg_quality,
                rejection_rate=rejection_rate,
                avg_confidence=avg_confidence,
            )

            scores.append(PromptScore(
                agent_name=row.agent_name,
                avg_output_quality=round(avg_quality, 3),
                avg_confidence=round(avg_confidence, 3),
                rejection_rate=round(rejection_rate, 3),
                improvement_hint=hint,
            ))

        return sorted(scores, key=lambda s: s.avg_confidence, reverse=True)

    def generate_insights(
        self,
        model_rankings: list[ModelRanking],
        prompt_scores: list[PromptScore],
    ) -> list[LearningInsight]:
        """Generate actionable insights from rankings and scores."""
        insights: list[LearningInsight] = []

        insights.extend(self._model_insights(model_rankings))
        insights.extend(self._prompt_insights(prompt_scores))
        insights.extend(self._failure_insights())
        insights.extend(self._speed_insights())
        insights.extend(self._global_insights())

        return sorted(insights, key=lambda i: i.priority)

    def _model_insights(
        self, rankings: list[ModelRanking]
    ) -> list[LearningInsight]:
        insights = []
        for r in rankings:
            if r.recommendation == "avoid" and r.sample_count >= MIN_SAMPLES:
                insights.append(LearningInsight(
                    insight_type=InsightType.MODEL_PERFORMANCE,
                    agent_name=r.agent_name,
                    model=r.model,
                    title=f"Model {r.model!r} underperforms for {r.agent_name}",
                    description=(
                        f"Model {r.model!r} shows avg quality {r.avg_quality:.2f} "
                        f"and success rate {r.success_rate:.0%} "
                        f"across {r.sample_count} runs for agent {r.agent_name}."
                    ),
                    recommendation=(
                        f"Replace {r.model!r} with a higher-quality model "
                        f"for {r.agent_name} agent tasks."
                    ),
                    evidence={
                        "avg_quality":  r.avg_quality,
                        "success_rate": r.success_rate,
                        "avg_duration": r.avg_duration,
                        "samples":      r.sample_count,
                    },
                    confidence=min(r.sample_count / 5, 1.0),
                    priority=2,
                ))
            elif r.success_rate >= 0.9 and r.avg_quality >= 0.7:
                insights.append(LearningInsight(
                    insight_type=InsightType.MODEL_PERFORMANCE,
                    agent_name=r.agent_name,
                    model=r.model,
                    title=f"Model {r.model!r} excels for {r.agent_name}",
                    description=(
                        f"Model {r.model!r} consistently delivers quality "
                        f"{r.avg_quality:.2f} with {r.success_rate:.0%} "
                        f"success rate for {r.agent_name}."
                    ),
                    recommendation=(
                        f"Continue using {r.model!r} as the primary model "
                        f"for {r.agent_name}. Consider it as default."
                    ),
                    evidence={"avg_quality": r.avg_quality, "samples": r.sample_count},
                    confidence=min(r.sample_count / 5, 1.0),
                    priority=5,
                ))
        return insights

    def _prompt_insights(
        self, scores: list[PromptScore]
    ) -> list[LearningInsight]:
        insights = []
        for s in scores:
            if s.rejection_rate > HIGH_REJECTION_RATE:
                insights.append(LearningInsight(
                    insight_type=InsightType.PROMPT_QUALITY,
                    agent_name=s.agent_name,
                    model=None,
                    title=f"High rejection rate for {s.agent_name} agent",
                    description=(
                        f"{s.agent_name} outputs are rejected {s.rejection_rate:.0%} "
                        f"of the time by the Decision Engine. "
                        f"Average confidence: {s.avg_confidence:.2f}."
                    ),
                    recommendation=s.improvement_hint,
                    evidence={
                        "rejection_rate":   s.rejection_rate,
                        "avg_confidence":   s.avg_confidence,
                        "avg_quality":      s.avg_output_quality,
                    },
                    confidence=0.8,
                    priority=1,
                ))
        return insights

    def _failure_insights(self) -> list[LearningInsight]:
        insights = []
        failures = (
            self._db.query(
                Reflection.agent_name,
                func.count(Reflection.id).label("fail_count"),
            )
            .filter(Reflection.success == False)
            .group_by(Reflection.agent_name)
            .having(func.count(Reflection.id) >= MIN_SAMPLES)
            .all()
        )

        for row in failures:
            insights.append(LearningInsight(
                insight_type=InsightType.FAILURE_PATTERN,
                agent_name=row.agent_name,
                model=None,
                title=f"Repeated failures detected for {row.agent_name}",
                description=(
                    f"Agent {row.agent_name} has failed {row.fail_count} "
                    f"times. Failures may indicate model incompatibility "
                    f"or task complexity mismatch."
                ),
                recommendation=(
                    f"Review failure logs for {row.agent_name}. "
                    f"Consider adding retry logic or switching to a "
                    f"more capable model."
                ),
                evidence={"failure_count": row.fail_count},
                confidence=0.9,
                priority=1,
            ))
        return insights

    def _speed_insights(self) -> list[LearningInsight]:
        insights = []
        slow_agents = (
            self._db.query(
                Reflection.agent_name,
                Reflection.model_used,
                func.avg(Reflection.duration_seconds).label("avg_dur"),
                func.count(Reflection.id).label("count"),
            )
            .filter(
                Reflection.duration_seconds > SLOW_THRESHOLD_S,
                Reflection.success == True,
            )
            .group_by(Reflection.agent_name, Reflection.model_used)
            .having(func.count(Reflection.id) >= MIN_SAMPLES)
            .all()
        )

        for row in slow_agents:
            insights.append(LearningInsight(
                insight_type=InsightType.SPEED_PATTERN,
                agent_name=row.agent_name,
                model=row.model_used,
                title=f"{row.agent_name} consistently slow with {row.model_used}",
                description=(
                    f"Agent {row.agent_name} averages {row.avg_dur:.0f}s "
                    f"with model {row.model_used!r} "
                    f"across {row.count} successful runs."
                ),
                recommendation=(
                    f"Try a smaller/faster model for {row.agent_name}. "
                    f"If quality is acceptable, llama3.2:3b reduces "
                    f"latency significantly."
                ),
                evidence={
                    "avg_duration_s": round(float(row.avg_dur), 1),
                    "samples":        row.count,
                    "model":          row.model_used,
                },
                confidence=min(row.count / 5, 1.0),
                priority=3,
            ))
        return insights

    def _global_insights(self) -> list[LearningInsight]:
        insights = []
        total = self._db.query(func.count(Reflection.id)).scalar() or 0
        if total < 5:
            return insights

        avg_q = (
            self._db.query(func.avg(Reflection.quality_score)).scalar() or 0
        )
        if float(avg_q) < LOW_QUALITY:
            insights.append(LearningInsight(
                insight_type=InsightType.IMPROVEMENT,
                agent_name=None,
                model=None,
                title="Platform-wide quality below target",
                description=(
                    f"Average output quality across all agents is "
                    f"{float(avg_q):.2f} (target: {LOW_QUALITY}). "
                    f"Based on {total} reflections."
                ),
                recommendation=(
                    "Review prompt templates for all agents. "
                    "Consider switching to higher-capability models. "
                    "Enable knowledge base for better context."
                ),
                evidence={"avg_quality": round(float(avg_q), 3), "total": total},
                confidence=0.85,
                priority=2,
            ))
        return insights

    def _generate_prompt_hint(
        self,
        agent_name: str,
        avg_quality: float,
        rejection_rate: float,
        avg_confidence: float,
    ) -> str:
        hints = []
        if avg_quality < 0.5:
            hints.append("Add explicit output format requirements (headers, bullets)")
        if rejection_rate > 0.4:
            hints.append("Add completion keywords (conclusion, summary, recommendation)")
        if avg_confidence < 0.5:
            hints.append("Add task alignment examples to the system prompt")
        if not hints:
            return f"Prompt for {agent_name} is performing well. No changes needed."
        return f"Prompt improvements for {agent_name}: " + "; ".join(hints)

