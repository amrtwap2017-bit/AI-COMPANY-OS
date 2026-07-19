"""
app/api/v1/routes/collaborate.py
────────────────────────────────────────────────────────────────
Multi-agent collaboration endpoints.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.collaboration.engine import CollaborationEngine
from app.collaboration.dispatcher import CollaborationDispatcher

router = APIRouter()


def get_engine(db: Session = Depends(get_db)) -> CollaborationEngine:
    return CollaborationEngine(db)


class CollaborateRequest(BaseModel):
    goal:           str
    strategy:       str | None = None
    custom_agents:  list[str] | None = None


def _run_to_dict(run) -> dict:
    return {
        "id":                     run.id,
        "goal":                   run.goal,
        "status":                 run.status,
        "agents_used":            run.agents_used,
        "agents_succeeded":       run.agents_succeeded,
        "agents_failed":          run.agents_failed,
        "total_duration_seconds": run.total_duration_seconds,
        "final_response":         run.final_response,
        "created_at":             run.created_at.isoformat(),
    }


@router.post("/collaborate")
def collaborate(
    req: CollaborateRequest,
    engine: CollaborationEngine = Depends(get_engine),
) -> dict:
    """
    Run a multi-agent collaboration.

    Strategies: research_and_write | plan_and_build |
                analyze_and_report | review_and_improve |
                full_pipeline

    Or provide custom_agents list for a custom sequential pipeline.
    """
    result = engine.run(
        goal=req.goal,
        strategy=req.strategy,
        custom_agents=req.custom_agents,
    )
    return {
        "collab_id":       result.collab_id,
        "goal":            result.goal,
        "status":          result.status.value,
        "final_response":  result.final_response,
        "total_duration":  result.total_duration,
        "agents_succeeded": result.agents_succeeded,
        "agents_failed":    result.agents_failed,
        "agents": [
            {
                "agent":     o.agent_name,
                "success":   o.success,
                "duration":  o.duration_seconds,
                "model":     o.model_used,
                "error":     o.error,
                "preview":   o.output[:300] if o.output else "",
            }
            for o in result.outputs
        ],
    }


@router.get("/collaborate")
def list_collaborations(
    limit: int = Query(default=20, ge=1, le=100),
    engine: CollaborationEngine = Depends(get_engine),
) -> dict:
    """List recent collaboration runs."""
    runs = engine.list_runs(limit=limit)
    return {
        "count": len(runs),
        "runs": [_run_to_dict(r) for r in runs],
    }


@router.get("/collaborate/{collab_id}")
def get_collaboration(
    collab_id: int,
    engine: CollaborationEngine = Depends(get_engine),
) -> dict:
    """Get a specific collaboration run with full detail."""
    run = engine.get_run(collab_id)
    if not run:
        raise HTTPException(
            status_code=404,
            detail=f"Collaboration {collab_id} not found",
        )
    return {
        **_run_to_dict(run),
        "agent_outputs": run.agent_outputs,
    }


@router.get("/collaborate/strategies/list")
def list_strategies() -> dict:
    """List available collaboration strategies."""
    d = CollaborationDispatcher()
    return {
        "strategies": d.list_strategies(),
        "description": {
            "research_and_write": "researcher → writer → evaluator",
            "plan_and_build":     "planner → architect → backend",
            "analyze_and_report": "analyst + researcher (parallel) → writer",
            "review_and_improve": "reviewer + tester (parallel) → backend",
            "full_pipeline":      "researcher + planner (parallel) → writer → evaluator",
        },
    }
