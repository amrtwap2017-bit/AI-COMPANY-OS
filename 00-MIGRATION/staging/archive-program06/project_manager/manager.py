"""
AI Project Manager — morning briefing, daily reports, next task decisions.
Uses qwen3.5:4b for speed (deepseek too slow for briefings).
"""
import httpx
import json
import dataclasses
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from src.db.engine import engine
from src.db.models import ProjectSnapshot, SprintMetric
from src.project_state.engine import build_project_state, get_task_counts
from src import hub_client
from src.settings import OLLAMA_BASE_URL, MODELS, TB_WORKSPACE_ROOT


def _call_ollama(prompt: str, model: str = None, timeout: int = 60) -> str:
    """Call Ollama — uses general model for speed."""
    model = model or MODELS["general"]
    try:
        r = httpx.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": (
                        "You are an AI Project Manager. Be concise and action-oriented. "
                        "Use bullet points. Maximum 200 words."
                    )},
                    {"role": "user", "content": prompt},
                ],
                "stream": False,
                "options": {"temperature": 0.1, "num_predict": 400},
            },
            timeout=timeout,
        )
        r.raise_for_status()
        return r.json()["message"]["content"].strip()
    except Exception as e:
        return f"[AI briefing unavailable: {str(e)[:50]}]"


def _save_snapshot(workspace_id: str, snapshot_type: str, data: dict) -> str:
    snap = ProjectSnapshot(
        workspace_id=workspace_id,
        snapshot_type=snapshot_type,
        snapshot_data=data,
    )
    with Session(engine) as s:
        s.add(snap)
        s.commit()
        return snap.id


def get_morning_briefing(workspace_id: str, workspace_root: str = "") -> dict:
    workspace_root = workspace_root or TB_WORKSPACE_ROOT
    state = build_project_state(workspace_id, workspace_root)

    prompt = (
        f"Sprint: {state.sprint_completion_pct}% complete. "
        f"Tasks: {state.tasks_completed} done, {state.tasks_failed} failed, {state.tasks_pending} pending. "
        f"Git branch: {state.current_branch}. Last commit: {state.last_commit_message[:80]}. "
        f"Failed tasks: {state.failing_tasks}. "
        f"Next recommended: {state.recommended_next_task_title}. "
        f"Write a 3-bullet morning briefing: status, risks, next action."
    )

    briefing_text = _call_ollama(prompt, timeout=45)

    result = {
        "workspace_id": workspace_id,
        "workspace_name": state.workspace_name,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "sprint_completion_pct": state.sprint_completion_pct,
        "tasks_summary": {
            "total": state.tasks_total,
            "completed": state.tasks_completed,
            "failed": state.tasks_failed,
            "pending": state.tasks_pending,
        },
        "git_state": {
            "branch": state.current_branch,
            "last_commit": state.last_commit_message,
            "uncommitted_count": len(state.uncommitted_files),
        },
        "avg_review_score": state.avg_review_score,
        "recommended_next": {
            "task_id": state.recommended_next_task_id,
            "task_title": state.recommended_next_task_title,
            "reason": state.recommended_next_reason,
        },
        "ai_briefing": briefing_text,
        "risks": state.failing_tasks,
    }

    _save_snapshot(workspace_id, "morning_briefing", result)
    return result


def get_project_state_snapshot(workspace_id: str, workspace_root: str = "") -> dict:
    workspace_root = workspace_root or TB_WORKSPACE_ROOT
    state = build_project_state(workspace_id, workspace_root)
    return dataclasses.asdict(state)


def decide_next_task(workspace_id: str, workspace_root: str = "") -> dict:
    workspace_root = workspace_root or TB_WORKSPACE_ROOT
    state = build_project_state(workspace_id, workspace_root)
    return {
        "ok": True,
        "task_id": state.recommended_next_task_id,
        "task_title": state.recommended_next_task_title,
        "reasoning": state.recommended_next_reason,
    }


def create_daily_report(workspace_id: str, workspace_root: str = "") -> dict:
    workspace_root = workspace_root or TB_WORKSPACE_ROOT
    state = build_project_state(workspace_id, workspace_root)

    report = {
        "date": datetime.now(timezone.utc).date().isoformat(),
        "sprint_completion_pct": state.sprint_completion_pct,
        "tasks_completed": state.tasks_completed,
        "tasks_failed": state.tasks_failed,
        "failing_tasks": state.failing_tasks,
        "recommended_next": state.recommended_next_task_title,
        "git_branch": state.current_branch,
    }

    snap_id = _save_snapshot(workspace_id, "daily_report", report)
    hub_client.remember(
        workspace_id=workspace_id,
        memory_type="project_state",
        subject=f"daily_report:{datetime.now().date()}",
        content=str(report),
    )
    return {"ok": True, "snapshot_id": snap_id, "report": report}


def update_sprint_metrics(workspace_id: str, sprint_name: str = "COMMERCIAL Sprint 1") -> dict:
    counts = get_task_counts(workspace_id)
    total = counts["total"]
    completed = counts["completed"]
    velocity = round((completed / total * 100) if total > 0 else 0.0, 1)

    metric = SprintMetric(
        workspace_id=workspace_id,
        sprint_name=sprint_name,
        total_tasks=total,
        completed_tasks=completed,
        failed_tasks=counts["failed"],
        blocked_tasks=counts["blocked"],
        velocity_score=velocity,
    )
    with Session(engine) as s:
        s.add(metric)
        s.commit()
        return {"ok": True, "id": metric.id, "velocity": velocity}
