"""
Analytics API Routes
────────────────────────────────────────────────────────────────
All routes are read-only GET endpoints.
The AnalyticsEngine is dependency-injected — never instantiated
directly in route handlers.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.analytics.engine import AnalyticsEngine
from app.db.database import get_db

router = APIRouter()


def get_engine(db: Session = Depends(get_db)) -> AnalyticsEngine:
    """Dependency: create AnalyticsEngine with injected session."""
    return AnalyticsEngine(db)


@router.get("/analytics/overview")
def overview(engine: AnalyticsEngine = Depends(get_engine)) -> dict:
    """Platform-wide summary statistics."""
    return engine.overview()


@router.get("/analytics/agents")
def agent_stats(engine: AnalyticsEngine = Depends(get_engine)) -> dict:
    """Per-agent call statistics, sorted by call volume."""
    return {"agents": engine.agent_stats()}


@router.get("/analytics/models")
def model_stats(engine: AnalyticsEngine = Depends(get_engine)) -> dict:
    """Per-model usage breakdown."""
    return {"models": engine.model_stats()}


@router.get("/analytics/workflows")
def workflow_stats(engine: AnalyticsEngine = Depends(get_engine)) -> dict:
    """Workflow execution statistics."""
    return engine.workflow_stats()


@router.get("/analytics/projects")
def project_stats(engine: AnalyticsEngine = Depends(get_engine)) -> dict:
    """Autonomous project execution statistics."""
    return engine.project_stats()


@router.get("/analytics/timeline")
def timeline(
    limit: int = Query(default=50, ge=1, le=200),
    engine: AnalyticsEngine = Depends(get_engine),
) -> dict:
    """Recent platform events in reverse chronological order."""
    return {"events": engine.event_timeline(limit=limit)}

@router.get("/analytics/cache")
def cache_stats() -> dict:
    """Response cache statistics."""
    from app.core.cache import response_cache
    return {"cache": response_cache.stats()}


@router.get("/analytics/costs/summary")
def cost_summary(engine: AnalyticsEngine = Depends(get_engine)) -> dict:
    """Platform-wide compute cost summary."""
    from app.analytics.cost import CostEngine
    cost = CostEngine(engine._db)
    return cost.summary()


@router.get("/analytics/costs/agents")
def agent_costs(engine: AnalyticsEngine = Depends(get_engine)) -> dict:
    """Per-agent compute cost breakdown."""
    from app.analytics.cost import CostEngine
    cost = CostEngine(engine._db)
    return {"agents": cost.agent_costs()}


@router.get("/analytics/costs/models")
def model_costs(engine: AnalyticsEngine = Depends(get_engine)) -> dict:
    """Per-model compute cost breakdown."""
    from app.analytics.cost import CostEngine
    cost = CostEngine(engine._db)
    return {"models": cost.model_costs()}
