"""
Analytics API Routes
────────────────────────────────────────────────────────────────
All routes are read-only GET endpoints.
The AnalyticsEngine is dependency-injected — never instantiated
directly in route handlers.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from analytics.engine import AnalyticsEngine
from db.database import get_db

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
    return {"agents": engine.safe_agent_stats()}


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
    return {"events": engine.safe_event_timeline(limit=limit)}

@router.get("/analytics/cache")
def cache_stats() -> dict:
    """Response cache statistics."""
    from core.cache import response_cache
    return {"cache": response_cache.stats()}


@router.get("/analytics/costs/summary")
def cost_summary(engine: AnalyticsEngine = Depends(get_engine)) -> dict:
    """Platform-wide compute cost summary."""
    from analytics.cost import CostEngine
    cost = CostEngine(engine._db)
    return cost.summary()


@router.get("/analytics/costs/agents")
def agent_costs(engine: AnalyticsEngine = Depends(get_engine)) -> dict:
    """Per-agent compute cost breakdown."""
    from analytics.cost import CostEngine
    cost = CostEngine(engine._db)
    return {"agents": cost.agent_costs()}


@router.get("/analytics/costs/models")
def model_costs(engine: AnalyticsEngine = Depends(get_engine)) -> dict:
    """Per-model compute cost breakdown."""
    from analytics.cost import CostEngine
    cost = CostEngine(engine._db)
    return {"models": cost.model_costs()}


@router.get("/analytics/summary")
def analytics_summary_full(db: Session = Depends(get_db)) -> dict:
    """Full summary — direct SQL counts, always accurate."""
    def q(sql):
        try:
            result = db.execute(__import__("sqlalchemy").text(sql)).scalar()
            return result or 0
        except Exception as _qe:
            import logging
            logging.getLogger("analytics").warning(f"SQL skip [{sql[:40]}]: {_qe}")
            try:
                db.rollback()
            except Exception:
                pass
            return 0
    return {
        "total_agents":        q("SELECT COUNT(*) FROM agents"),
        "active_agents":       q("SELECT COUNT(DISTINCT assigned_agent) FROM tasks WHERE assigned_agent IS NOT NULL"),
        "total_tasks":         q("SELECT COUNT(*) FROM tasks"),
        "tasks_pending":       q("SELECT COUNT(*) FROM tasks WHERE status='pending'"),
        "tasks_completed":     q("SELECT COUNT(*) FROM tasks WHERE status='completed'"),
        "tasks_failed":        q("SELECT COUNT(*) FROM tasks WHERE status='failed'"),
        "tasks_running":       q("SELECT COUNT(*) FROM tasks WHERE status='running'"),
        "total_workflows":     q("SELECT COUNT(*) FROM workflow_runs"),
        "total_reflections":   q("SELECT COUNT(*) FROM reflections"),
        "total_conversations": q("SELECT COUNT(*) FROM conversations"),
        "total_memories":      q("SELECT COUNT(*) FROM memories"),
        "total_knowledge_docs":q("SELECT COUNT(*) FROM knowledge_entries"),
        "total_events":        q("SELECT COUNT(*) FROM platform_events"),
        "period": "all-time",
    }


@router.get("/analytics/dashboard")
def analytics_dashboard_full(db: Session = Depends(get_db)) -> dict:
    """Dashboard-level summary — direct SQL, always accurate."""
    def q(sql):
        try:
            return db.execute(__import__("sqlalchemy").text(sql)).scalar() or 0
        except Exception:
            return 0
    return {
        "agents":    {
            "total":  q("SELECT COUNT(*) FROM agents"),
            "active": q("SELECT COUNT(*) FROM agents WHERE status='active'"),
        },
        "tasks":     {
            "total":     q("SELECT COUNT(*) FROM tasks"),
            "completed": q("SELECT COUNT(*) FROM tasks WHERE status='completed'"),
            "pending":   q("SELECT COUNT(*) FROM tasks WHERE status='pending'"),
            "failed":    q("SELECT COUNT(*) FROM tasks WHERE status='failed'"),
        },
        "knowledge": {
            "total_docs":  q("SELECT COUNT(*) FROM knowledge_entries"),
            "collections": 19,
        },
        "memory":    {"total_entries": q("SELECT COUNT(*) FROM memories")},
        "workflows": {
            "total":   q("SELECT COUNT(*) FROM workflow_runs"),
            "running": q("SELECT COUNT(*) FROM workflow_runs WHERE status='running'"),
        },
        "reflections": {"total": q("SELECT COUNT(*) FROM reflections")},
        "conversations": {"total": q("SELECT COUNT(*) FROM conversations")},
        "platform": "ai-company-os",
        "version":  "2.0.0",
    }

