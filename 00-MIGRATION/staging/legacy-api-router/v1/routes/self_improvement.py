"""
app/api/v1/routes/self_improvement.py
Agent self-improvement endpoints.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.evaluation.prompt_version_store import PromptVersionStore

router = APIRouter()


class RunImprovementRequest(BaseModel):
    agents:   list[str] | None = None
    dry_run:  bool             = False


class SavePromptRequest(BaseModel):
    agent_name:     str
    content:        str
    change_summary: str = ""


def _version_to_dict(v) -> dict:
    return {
        "id":             v.id,
        "agent":          v.agent_name,
        "version":        v.version,
        "source":         v.source,
        "is_active":      v.is_active,
        "change_summary": v.change_summary,
        "quality_before": v.quality_score_before,
        "hints":          v.improvement_hints or [],
        "content_length": len(v.content),
        "created_at":     v.created_at.isoformat(),
    }


@router.post("/self-improvement/run")
def run_self_improvement(
    req: RunImprovementRequest,
    db: Session = Depends(get_db),
) -> dict:
    """
    Run agent self-improvement pipeline.
    WARNING: Calls Ollama to generate improved prompts.

    agents=null  → auto-detect struggling agents
    agents=["planner"] → improve specific agents
    dry_run=true → analyze but do not save
    """
    from app.evaluation.self_improvement import SelfImprovementEngine

    engine = SelfImprovementEngine(db)
    report = engine.run(
        force_agents=req.agents,
        dry_run=req.dry_run,
    )

    return {
        "summary":         report.summary,
        "agents_analyzed": report.agents_analyzed,
        "agents_improved": report.agents_improved,
        "agents_skipped":  report.agents_skipped,
        "dry_run":         req.dry_run,
        "improvements": [
            {
                "agent":          i.agent_name,
                "triggered_by":   i.triggered_by,
                "quality_before": i.quality_before,
                "activated":      i.activated,
                "version_id":     i.version_id,
                "change_summary": i.optimization.change_summary,
                "meaningfully_different": i.optimization.is_meaningfully_different,
            }
            for i in report.improvements
        ],
    }


@router.get("/self-improvement/prompts/{agent_name}")
def prompt_history(
    agent_name: str,
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
) -> dict:
    """Get version history for an agent's prompt."""
    store   = PromptVersionStore(db)
    history = store.get_history(agent_name, limit=limit)
    active  = store.get_active(agent_name)

    return {
        "agent":          agent_name,
        "active_version": active.version if active else None,
        "total_versions": len(history),
        "history":        [_version_to_dict(v) for v in history],
    }


@router.post("/self-improvement/prompts/{agent_name}/rollback")
def rollback_prompt(
    agent_name: str,
    db: Session = Depends(get_db),
) -> dict:
    """Roll back an agent's prompt to the previous version."""
    store    = PromptVersionStore(db)
    previous = store.rollback(agent_name)

    if not previous:
        raise HTTPException(
            status_code=400,
            detail=f"No previous version to roll back to for {agent_name!r}",
        )

    return {
        "agent":            agent_name,
        "rolled_back_to":   previous.version,
        "version_id":       previous.id,
        "content_length":   len(previous.content),
    }


@router.post("/self-improvement/prompts/import")
def import_existing_prompts(db: Session = Depends(get_db)) -> dict:
    """Import all existing .md prompt files into the version store."""
    store    = PromptVersionStore(db)
    imported = store.import_existing_prompts()
    return {
        "imported": imported,
        "message":  f"Imported {imported} prompt files as v1",
    }


@router.post("/self-improvement/prompts/save")
def save_prompt(
    req: SavePromptRequest,
    activate: bool = Query(default=True),
    db: Session = Depends(get_db),
) -> dict:
    """Manually save a new prompt version."""
    store = PromptVersionStore(db)

    if activate:
        record = store.save_and_activate(
            agent_name=req.agent_name,
            content=req.content,
            source="manual",
            change_summary=req.change_summary,
        )
    else:
        record = store.save_version(
            agent_name=req.agent_name,
            content=req.content,
            source="manual",
            change_summary=req.change_summary,
        )

    return {
        "version_id":  record.id,
        "version":     record.version,
        "agent":       record.agent_name,
        "activated":   activate,
    }
