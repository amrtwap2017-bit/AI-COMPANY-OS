"""
app/api/v1/routes/reflections.py
────────────────────────────────────────────────────────────────
Reflection API endpoints.
Query reflection history and agent quality metrics.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from db.database import get_db
from reflection.engine import ReflectionEngine

router = APIRouter()


def get_reflection_engine(
    db: Session = Depends(get_db),
) -> ReflectionEngine:
    return ReflectionEngine(db)


@router.get("/reflections")
def list_reflections(
    agent_name: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    engine: ReflectionEngine = Depends(get_reflection_engine),
) -> dict:
    """List recent reflections, optionally filtered by agent."""
    refs = engine.get_reflections(agent_name=agent_name, limit=limit)
    return {
        "count": len(refs),
        "reflections": [
            {
                "id": r.id,
                "agent": r.agent_name,
                "model": r.model_used,
                "task": r.task[:200],
                "status": r.status,
                "success": r.success,
                "quality_score": r.quality_score,
                "speed_rating": r.speed_rating,
                "failure_reason": r.failure_reason,
                "lessons": r.lessons,
                "improvements": r.improvements,
                "duration_seconds": r.duration_seconds,
                "created_at": r.created_at.isoformat(),
            }
            for r in refs
        ],
    }


@router.get("/reflections/failures")
def list_failures(
    agent_name: str | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=50),
    engine: ReflectionEngine = Depends(get_reflection_engine),
) -> dict:
    """List recent failures with analysis."""
    refs = engine.get_failure_patterns(agent_name=agent_name, limit=limit)
    return {
        "count": len(refs),
        "failures": [
            {
                "id": r.id,
                "agent": r.agent_name,
                "task": r.task[:200],
                "failure_reason": r.failure_reason,
                "improvements": r.improvements,
                "duration_seconds": r.duration_seconds,
                "created_at": r.created_at.isoformat(),
            }
            for r in refs
        ],
    }


@router.get("/reflections/quality/{agent_name}")
def agent_quality(
    agent_name: str,
    engine: ReflectionEngine = Depends(get_reflection_engine),
) -> dict:
    """Get quality metrics for a specific agent."""
    return engine.get_agent_quality(agent_name)
