from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/orchestrator", tags=["Orchestrator"])

_pipeline_runs: list[dict] = []
_snapshots: list[dict] = []
_retrospectives: list[dict] = []

@router.get("/status")
async def orchestrator_status():
    return {
        "status": "online",
        "pipeline_runs": len(_pipeline_runs),
        "snapshots": len(_snapshots),
        "retrospectives": len(_retrospectives),
        "last_updated": datetime.utcnow().isoformat(),
    }

@router.get("/runs")
async def get_pipeline_runs():
    return {"runs": _pipeline_runs, "total": len(_pipeline_runs)}

@router.post("/runs")
async def create_pipeline_run(payload: dict):
    run = {
        "id": len(_pipeline_runs) + 1,
        "ts": datetime.utcnow().isoformat(),
        "stage": payload.get("stage", "unknown"),
        "status": payload.get("status", "pending"),
        "duration_ms": payload.get("duration_ms", 0),
        "metadata": payload.get("metadata", {}),
    }
    _pipeline_runs.append(run)
    return run

@router.get("/snapshots")
async def get_snapshots():
    return {"snapshots": _snapshots, "total": len(_snapshots)}

@router.post("/snapshots")
async def create_snapshot(payload: dict):
    snap = {
        "id": len(_snapshots) + 1,
        "ts": datetime.utcnow().isoformat(),
        "label": payload.get("label", "snapshot"),
        "state": payload.get("state", {}),
    }
    _snapshots.append(snap)
    return snap

@router.get("/retrospectives")
async def get_retrospectives():
    return {"retrospectives": _retrospectives, "total": len(_retrospectives)}

@router.post("/retrospectives")
async def create_retrospective(payload: dict):
    retro = {
        "id": len(_retrospectives) + 1,
        "ts": datetime.utcnow().isoformat(),
        "summary": payload.get("summary", ""),
        "wins": payload.get("wins", []),
        "blockers": payload.get("blockers", []),
        "next_actions": payload.get("next_actions", []),
    }
    _retrospectives.append(retro)
    return retro

@router.get("/observability")
async def get_observability():
    stages = ["plan","build","test","review","deploy"]
    return {
        "pipeline_runs": len(_pipeline_runs),
        "snapshots": len(_snapshots),
        "retrospectives": len(_retrospectives),
        "stage_performance": {s: {"avg_ms": 0, "runs": 0} for s in stages},
        "status_breakdown": {"pending": 0, "running": 0, "success": 0, "failed": 0},
        "last_updated": datetime.utcnow().isoformat(),
    }

@router.get("/state")
async def get_orchestrator_state():
    return {
        "active_agents": [],
        "queued_tasks": 0,
        "running_tasks": 0,
        "completed_tasks": 0,
        "last_updated": datetime.utcnow().isoformat(),
    }

@router.get("/briefing")
async def get_briefing():
    return {
        "date": datetime.utcnow().isoformat()[:10],
        "summary": "No briefing generated yet.",
        "priorities": [],
        "blockers": [],
        "agents_available": 16,
    }

@router.post("/run-task")
async def run_orchestrator_task(payload: dict):
    return {
        "task_id": f"task-{datetime.utcnow().timestamp():.0f}",
        "status": "queued",
        "agent": payload.get("agent", "planner"),
        "input": payload.get("input", ""),
        "ts": datetime.utcnow().isoformat(),
    }
