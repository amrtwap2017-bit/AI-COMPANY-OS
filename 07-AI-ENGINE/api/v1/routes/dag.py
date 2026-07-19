"""
app/api/v1/routes/dag.py
────────────────────────────────────────────────────────────────
DAG execution API endpoints.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.database import get_db
from dag.engine import DAGEngine
from dag.models import NodeStatus

router = APIRouter()


def get_engine(db: Session = Depends(get_db)) -> DAGEngine:
    return DAGEngine(db)


class DAGRunRequest(BaseModel):
    goal:            str
    pattern:         str | None       = None
    agents:          list[str] | None = None
    sequential:      bool             = False
    skip_on_failure: bool             = False
    timeout_s:       int              = 300
    max_retries:     int              = 1


def _run_to_dict(run) -> dict:
    return {
        "id":               run.id,
        "goal":             run.goal,
        "pattern":          run.pattern,
        "status":           run.status,
        "total_nodes":      run.total_nodes,
        "completed_nodes":  run.completed_nodes,
        "failed_nodes":     run.failed_nodes,
        "total_duration_s": run.total_duration_s,
        "created_at":       run.created_at.isoformat(),
    }


@router.post("/dag/run")
def run_dag(
    req: DAGRunRequest,
    engine: DAGEngine = Depends(get_engine),
) -> dict:
    """
    Execute a DAG workflow.

    Patterns: research_and_write | parallel_research | plan_and_build |
              full_pipeline | review_and_fix | deep_research

    Or provide agents list for custom pipeline.
    sequential=True  → agents run one after another (chain)
    sequential=False → agents run in parallel where possible
    """
    execution = engine.run(
        goal=req.goal,
        pattern=req.pattern,
        agents=req.agents,
        sequential=req.sequential,
        skip_on_failure=req.skip_on_failure,
        timeout_s=req.timeout_s,
        max_retries=req.max_retries,
    )
    return {
        "dag_id":          execution.dag_id,
        "goal":            execution.graph.goal,
        "status":          execution.status.value,
        "total_duration_s": round(execution.total_duration, 2),
        "succeeded":       execution.succeeded_count,
        "failed":          execution.failed_count,
        "nodes": [
            {
                "node_id":    n.node_id,
                "agent":      n.agent_name,
                "status":     n.status.value,
                "model":      n.model_used,
                "duration_s": n.duration_s,
                "error":      n.error,
                "output_preview": n.output[:300] if n.output else "",
            }
            for n in execution.graph.nodes
        ],
    }


@router.get("/dag/runs")
def list_runs(
    limit: int = Query(default=20, ge=1, le=100),
    engine: DAGEngine = Depends(get_engine),
) -> dict:
    """List recent DAG runs."""
    runs = engine.list_runs(limit=limit)
    return {
        "count": len(runs),
        "runs":  [_run_to_dict(r) for r in runs],
    }


@router.get("/dag/runs/{dag_id}")
def get_run(
    dag_id: int,
    engine: DAGEngine = Depends(get_engine),
) -> dict:
    """Get a specific DAG run with full checkpoint data."""
    run = engine.get_run(dag_id)
    if not run:
        raise HTTPException(
            status_code=404,
            detail=f"DAG run {dag_id} not found",
        )
    return {
        **_run_to_dict(run),
        "final_output":   run.final_output,
        "graph_definition": run.graph_definition,
        "checkpoint_data":  run.checkpoint_data,
    }


@router.get("/dag/patterns")
def list_patterns(engine: DAGEngine = Depends(get_engine)) -> dict:
    """List available DAG execution patterns."""
    return {
        "patterns": engine.list_patterns(),
        "descriptions": {
            "research_and_write":  "researcher → writer → evaluator",
            "parallel_research":   "researcher + analyst (parallel) → writer → evaluator",
            "plan_and_build":      "planner → architect → backend + frontend → tester",
            "full_pipeline":       "researcher + planner (parallel) → writer → evaluator",
            "review_and_fix":      "reviewer + tester (parallel) → backend",
            "deep_research":       "researcher + analyst + knowledge_manager → writer → evaluator",
        },
    }
