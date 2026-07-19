"""
app/api/v1/routes/benchmarks.py
────────────────────────────────────────────────────────────────
Evaluation framework API endpoints.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.evaluation.runner import BenchmarkRunner
from app.evaluation.benchmarks import (
    get_benchmarks, get_benchmark, list_agents_with_benchmarks
)

router = APIRouter()


def get_runner(db: Session = Depends(get_db)) -> BenchmarkRunner:
    return BenchmarkRunner(db)


class RunBenchmarkRequest(BaseModel):
    benchmark_id: str | None = None
    agent_name:   str | None = None
    use_llm:      bool       = False
    run_group:    str        = "api"


def _result_to_dict(r) -> dict:
    return {
        "benchmark_id":   r.benchmark_id,
        "agent":          r.agent_name,
        "rule_score":     r.rule_score,
        "llm_score":      r.llm_score,
        "composite_score": r.composite_score,
        "is_regression":  r.is_regression,
        "baseline_score": r.baseline_score,
        "duration_s":     r.duration_s,
        "run_id":         r.run_id,
        "feedback":       r.feedback,
        "output_preview": r.output_preview,
    }


def _db_run_to_dict(r) -> dict:
    return {
        "id":             r.id,
        "benchmark_id":   r.benchmark_id,
        "agent":          r.agent_name,
        "model":          r.model_used,
        "rule_score":     r.rule_score,
        "llm_score":      r.llm_score,
        "composite_score": r.composite_score,
        "is_regression":  r.is_regression,
        "baseline_score": r.baseline_score,
        "duration_s":     r.duration_s,
        "run_group":      r.run_group,
        "triggered_by":   r.triggered_by,
        "created_at":     r.created_at.isoformat(),
    }


@router.get("/benchmarks")
def list_benchmarks() -> dict:
    """List all available benchmarks."""
    benchmarks = get_benchmarks()
    return {
        "total": len(benchmarks),
        "agents": list_agents_with_benchmarks(),
        "benchmarks": [
            {
                "id":          b.benchmark_id,
                "agent":       b.agent_name,
                "description": b.description,
                "min_length":  b.min_length,
                "keywords":    b.keywords,
            }
            for b in benchmarks
        ],
    }


@router.post("/benchmarks/run")
def run_benchmark(
    req: RunBenchmarkRequest,
    runner: BenchmarkRunner = Depends(get_runner),
) -> dict:
    """
    Run one benchmark or all benchmarks for an agent.
    WARNING: Calls Ollama — takes 60-300 seconds per benchmark.

    use_llm=true also calls LLM evaluator (much slower).
    """
    if req.benchmark_id:
        result = runner.run_one(
            benchmark_id=req.benchmark_id,
            use_llm=req.use_llm,
            run_group=req.run_group,
        )
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"Benchmark {req.benchmark_id!r} not found",
            )
        return {
            "type":   "single",
            "result": _result_to_dict(result),
        }

    elif req.agent_name:
        suite = runner.run_agent(
            agent_name=req.agent_name,
            use_llm=req.use_llm,
            run_group=req.run_group,
        )
        return {
            "type":        "suite",
            "agent":       req.agent_name,
            "total":       suite.total,
            "passed":      suite.passed,
            "regressions": suite.regressions,
            "avg_score":   suite.avg_score,
            "run_group":   suite.run_group,
            "results":     [_result_to_dict(r) for r in suite.results],
        }

    else:
        raise HTTPException(
            status_code=400,
            detail="Provide either benchmark_id or agent_name",
        )


@router.get("/benchmarks/history/{benchmark_id}")
def benchmark_history(
    benchmark_id: str,
    limit:  int = Query(default=20, ge=1, le=100),
    runner: BenchmarkRunner = Depends(get_runner),
) -> dict:
    """Get historical runs for a specific benchmark."""
    runs = runner.get_history(benchmark_id, limit=limit)
    return {
        "benchmark_id": benchmark_id,
        "count":        len(runs),
        "runs":         [_db_run_to_dict(r) for r in runs],
    }


@router.get("/benchmarks/agent/{agent_name}")
def agent_benchmark_summary(
    agent_name: str,
    runner: BenchmarkRunner = Depends(get_runner),
) -> dict:
    """Quality summary for an agent across all its benchmarks."""
    return runner.get_agent_summary(agent_name)


@router.get("/benchmarks/regressions")
def list_regressions(
    limit:  int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> dict:
    """List all detected regressions."""
    from app.models.db.benchmark import BenchmarkRun
    runs = (
        db.query(BenchmarkRun)
        .filter(BenchmarkRun.is_regression == True)  # noqa: E712
        .order_by(BenchmarkRun.created_at.desc())
        .limit(limit)
        .all()
    )
    return {
        "count":       len(runs),
        "regressions": [_db_run_to_dict(r) for r in runs],
    }
