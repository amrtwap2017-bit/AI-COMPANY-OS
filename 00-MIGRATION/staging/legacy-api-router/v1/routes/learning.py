"""
app/api/v1/routes/learning.py
────────────────────────────────────────────────────────────────
Learning Engine API endpoints.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.learning.engine import LearningEngine

router = APIRouter()


def get_engine(db: Session = Depends(get_db)) -> LearningEngine:
    return LearningEngine(db)


def _insight_to_dict(r) -> dict:
    return {
        "id":             r.id,
        "type":           r.insight_type,
        "agent":          r.agent_name,
        "model":          r.model,
        "title":          r.title,
        "description":    r.description,
        "recommendation": r.recommendation,
        "confidence":     r.confidence,
        "priority":       r.priority,
        "applied":        r.applied,
        "evidence":       r.evidence or {},
        "created_at":     r.created_at.isoformat(),
    }


@router.post("/learning/run")
def run_learning(
    engine: LearningEngine = Depends(get_engine),
) -> dict:
    """
    Run the full learning pipeline.
    Analyzes reflections + decisions, generates insights, saves to DB.
    Returns the complete learning report.
    """
    report = engine.run()

    return {
        "summary":        report.summary,
        "total_analyzed": report.total_analyzed,
        "insights_count": len(report.insights),
        "model_rankings": [
            {
                "agent":          r.agent_name,
                "model":          r.model,
                "avg_quality":    r.avg_quality,
                "avg_duration_s": r.avg_duration,
                "success_rate":   r.success_rate,
                "samples":        r.sample_count,
                "recommendation": r.recommendation,
            }
            for r in report.model_rankings
        ],
        "prompt_scores": [
            {
                "agent":           s.agent_name,
                "avg_quality":     s.avg_output_quality,
                "avg_confidence":  s.avg_confidence,
                "rejection_rate":  s.rejection_rate,
                "hint":            s.improvement_hint,
            }
            for s in report.prompt_scores
        ],
        "insights": [
            {
                "priority":       i.priority,
                "type":           i.insight_type.value,
                "agent":          i.agent_name,
                "title":          i.title,
                "recommendation": i.recommendation,
                "confidence":     i.confidence,
            }
            for i in report.insights
        ],
    }


@router.get("/learning/insights")
def list_insights(
    limit:        int = Query(default=20, ge=1, le=100),
    insight_type: str | None = Query(default=None),
    agent_name:   str | None = Query(default=None),
    min_priority: int | None = Query(default=None, ge=1, le=5),
    engine: LearningEngine = Depends(get_engine),
) -> dict:
    """List stored learning insights with optional filters."""
    records = engine.get_insights(
        limit=limit,
        insight_type=insight_type,
        agent_name=agent_name,
        min_priority=min_priority,
    )
    return {
        "count":    len(records),
        "insights": [_insight_to_dict(r) for r in records],
    }


@router.get("/learning/actionable")
def actionable_insights(
    engine: LearningEngine = Depends(get_engine),
) -> dict:
    """Return high-priority unactioned insights (priority 1-2)."""
    records = engine.get_actionable(limit=10)
    return {
        "count":    len(records),
        "insights": [_insight_to_dict(r) for r in records],
    }


@router.get("/learning/models")
def model_recommendations(
    engine: LearningEngine = Depends(get_engine),
) -> dict:
    """Return best model recommendations per agent based on history."""
    recommendations = engine.get_model_recommendations()
    return {
        "count":           len(recommendations),
        "recommendations": recommendations,
    }


@router.get("/learning/summary")
def learning_summary(
    engine: LearningEngine = Depends(get_engine),
) -> dict:
    """High-level learning system summary."""
    return engine.get_insight_summary()


@router.post("/learning/insights/{insight_id}/apply")
def mark_applied(
    insight_id: int,
    engine: LearningEngine = Depends(get_engine),
) -> dict:
    """Mark an insight as applied/actioned."""
    success = engine.mark_applied(insight_id)
    return {"applied": success, "insight_id": insight_id}
