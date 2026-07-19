"""
app/api/v1/routes/decisions.py
────────────────────────────────────────────────────────────────
Decision Engine API endpoints.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.database import get_db
from decision.engine import DecisionEngine
from decision.models import DecisionInput

router = APIRouter()


def get_engine(db: Session = Depends(get_db)) -> DecisionEngine:
    return DecisionEngine(db)


class EvaluateRequest(BaseModel):
    agent_name: str
    task:       str
    output:     str
    model_used: str = "unknown"
    duration_s: float = 0.0


def _record_to_dict(r) -> dict:
    return {
        "id":             r.id,
        "agent":          r.agent_name,
        "task":           r.task[:200],
        "model":          r.model_used,
        "confidence":     r.confidence,
        "verdict":        r.verdict,
        "risk_level":     r.risk_level,
        "risk_flags":     r.risk_flags or [],
        "alternatives":   r.alternatives or [],
        "reasoning":      r.reasoning,
        "output_length":  r.output_length,
        "duration_s":     r.duration_seconds,
        "created_at":     r.created_at.isoformat(),
    }


@router.post("/decisions/evaluate")
def evaluate(
    req: EvaluateRequest,
    engine: DecisionEngine = Depends(get_engine),
) -> dict:
    """
    Evaluate an agent output and return a decision.
    Saves the decision record to the database.
    """
    result = engine.evaluate(DecisionInput(
        agent_name=req.agent_name,
        task=req.task,
        output=req.output,
        model_used=req.model_used,
        duration_s=req.duration_s,
    ))

    return {
        "confidence":    result.confidence,
        "verdict":       result.verdict.value,
        "risk_level":    result.risk_level.value,
        "reasoning":     result.reasoning,
        "should_retry":  result.should_retry,
        "should_escalate": result.should_escalate,
        "risk_flags": [
            {
                "category":    f.category,
                "description": f.description,
                "severity":    f.severity.value,
                "evidence":    f.evidence,
            }
            for f in result.risk_flags
        ],
        "alternatives": [
            {
                "approach":  a.approach,
                "rationale": a.rationale,
                "agents":    a.agents,
            }
            for a in result.alternatives
        ],
    }


@router.get("/decisions")
def list_decisions(
    agent_name: str | None = Query(default=None),
    verdict:    str | None = Query(default=None),
    limit:      int        = Query(default=20, ge=1, le=100),
    engine: DecisionEngine = Depends(get_engine),
) -> dict:
    """List recent decision records."""
    records = engine.get_decisions(
        agent_name=agent_name,
        verdict=verdict,
        limit=limit,
    )
    return {
        "count":     len(records),
        "decisions": [_record_to_dict(r) for r in records],
    }


@router.get("/decisions/agent/{agent_name}")
def agent_confidence(
    agent_name: str,
    engine: DecisionEngine = Depends(get_engine),
) -> dict:
    """Get confidence statistics for a specific agent."""
    return engine.get_agent_confidence(agent_name)


@router.get("/decisions/{decision_id}")
def get_decision(
    decision_id: int,
    engine: DecisionEngine = Depends(get_engine),
) -> dict:
    """Get a specific decision record."""
    from models.db.decision import DecisionRecord
    from db.database import get_db
    records = engine.get_decisions(limit=1000)
    record = next((r for r in records if r.id == decision_id), None)
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"Decision {decision_id} not found",
        )
    return _record_to_dict(record)
