"""
app/api/v1/routes/tasks.py
────────────────────────────────────────────────────────────────
Background task management endpoints.

All long-running operations now return immediately with a task_id.
Poll GET /tasks/{task_id} to check status and get result.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.tasks.repository import TaskRepository
from app.tasks.queue import task_queue

router = APIRouter()


def get_repo(db: Session = Depends(get_db)) -> TaskRepository:
    return TaskRepository(db)


def _task_to_dict(t) -> dict:
    return {
        "id":               t.id,
        "task_type":        t.task_type,
        "task_name":        t.task_name,
        "status":           t.status,
        "progress":         t.progress,
        "progress_message": t.progress_message,
        "result_id":        t.result_id,
        "error":            t.error,
        "duration_seconds": t.duration_seconds,
        "submitted_by":     t.submitted_by,
        "started_at":       t.started_at,
        "completed_at":     t.completed_at,
        "created_at":       t.created_at.isoformat(),
    }


# ── Submit endpoints ──────────────────────────────────────────

class ProjectTaskRequest(BaseModel):
    name:          str
    goal:          str
    owner:         str  = "system"
    template:      str | None = None
    use_ai_planner: bool = False


class DAGTaskRequest(BaseModel):
    goal:            str
    pattern:         str | None       = None
    agents:          list[str] | None = None
    sequential:      bool             = False
    skip_on_failure: bool             = False
    timeout_s:       int              = 300
    max_retries:     int              = 1


class CollaborationTaskRequest(BaseModel):
    goal:           str
    strategy:       str | None       = None
    custom_agents:  list[str] | None = None


class WorkflowTaskRequest(BaseModel):
    goal:           str
    template_name:  str  = "research_report"
    use_ai_planner: bool = False


class NewsIngestTaskRequest(BaseModel):
    url:           str | None = None
    category:      str        = "general"
    category_name: str | None = None
    max_articles:  int        = 15
    max_per_feed:  int        = 10
    ingest_all:    bool       = False


@router.post("/tasks/project")
def submit_project(req: ProjectTaskRequest) -> dict:
    """
    Submit a project run as a background task.
    Returns task_id immediately — project runs in background.
    Poll GET /tasks/{task_id} for status.
    """
    from app.tasks.handlers import run_project_task

    task_id = task_queue.submit(
        task_type="project_run",
        task_name=req.name,
        params=req.model_dump(),
        handler=run_project_task,
        submitted_by=req.owner,
    )
    return {
        "task_id":  task_id,
        "status":   "pending",
        "message":  f"Project {req.name!r} queued for background execution",
        "poll_url": f"/api/v1/tasks/{task_id}",
    }


@router.post("/tasks/dag")
def submit_dag(req: DAGTaskRequest) -> dict:
    """
    Submit a DAG execution as a background task.
    Returns task_id immediately.
    """
    from app.tasks.handlers import run_dag_task

    task_id = task_queue.submit(
        task_type="dag_run",
        task_name=f"DAG: {req.goal[:60]}",
        params=req.model_dump(),
        handler=run_dag_task,
    )
    return {
        "task_id":  task_id,
        "status":   "pending",
        "message":  "DAG queued for background execution",
        "poll_url": f"/api/v1/tasks/{task_id}",
    }


@router.post("/tasks/collaboration")
def submit_collaboration(req: CollaborationTaskRequest) -> dict:
    """
    Submit a multi-agent collaboration as a background task.
    """
    from app.tasks.handlers import run_collaboration_task

    task_id = task_queue.submit(
        task_type="collaboration_run",
        task_name=f"Collaborate: {req.goal[:60]}",
        params=req.model_dump(),
        handler=run_collaboration_task,
    )
    return {
        "task_id":  task_id,
        "status":   "pending",
        "message":  "Collaboration queued for background execution",
        "poll_url": f"/api/v1/tasks/{task_id}",
    }


@router.post("/tasks/workflow")
def submit_workflow(req: WorkflowTaskRequest) -> dict:
    """Submit a workflow run as a background task."""
    from app.tasks.handlers import run_workflow_task

    task_id = task_queue.submit(
        task_type="workflow_run",
        task_name=f"Workflow: {req.goal[:60]}",
        params=req.model_dump(),
        handler=run_workflow_task,
    )
    return {
        "task_id":  task_id,
        "status":   "pending",
        "message":  "Workflow queued for background execution",
        "poll_url": f"/api/v1/tasks/{task_id}",
    }


@router.post("/tasks/learning")
def submit_learning() -> dict:
    """Submit a learning engine run as a background task."""
    from app.tasks.handlers import run_learning_task

    task_id = task_queue.submit(
        task_type="learning_run",
        task_name="Learning Engine Run",
        params={},
        handler=run_learning_task,
    )
    return {
        "task_id":  task_id,
        "status":   "pending",
        "message":  "Learning engine queued",
        "poll_url": f"/api/v1/tasks/{task_id}",
    }


@router.post("/tasks/news")
def submit_news_ingest(req: NewsIngestTaskRequest) -> dict:
    """Submit a news RSS ingestion as a background task."""
    from app.tasks.handlers import run_news_ingest_task

    task_id = task_queue.submit(
        task_type="news_ingest",
        task_name=f"News: {req.category or req.url or 'all'}",
        params=req.model_dump(),
        handler=run_news_ingest_task,
    )
    return {
        "task_id":  task_id,
        "status":   "pending",
        "message":  "News ingestion queued",
        "poll_url": f"/api/v1/tasks/{task_id}",
    }


# ── Query endpoints ───────────────────────────────────────────

@router.get("/tasks/{task_id}")
def get_task(
    task_id: int,
    repo: TaskRepository = Depends(get_repo),
) -> dict:
    """Get status of a specific background task."""
    task = repo.get(task_id)
    if not task:
        raise HTTPException(
            status_code=404,
            detail=f"Task {task_id} not found",
        )
    return _task_to_dict(task)


@router.get("/tasks")
def list_tasks(
    status:    str | None = Query(default=None),
    task_type: str | None = Query(default=None),
    limit:     int        = Query(default=20, ge=1, le=100),
    repo: TaskRepository  = Depends(get_repo),
) -> dict:
    """List background tasks with optional filters."""
    tasks = repo.list_all(
        status=status,
        task_type=task_type,
        limit=limit,
    )
    return {
        "count": len(tasks),
        "tasks": [_task_to_dict(t) for t in tasks],
    }


@router.get("/tasks/stats/summary")
def task_stats(
    repo: TaskRepository = Depends(get_repo),
) -> dict:
    """Task queue statistics."""
    stats = repo.stats()
    return {
        "stats":        stats,
        "queue_active": task_queue._started,
        "workers":      2,
    }


@router.post("/tasks/{task_id}/cancel")
def cancel_task(
    task_id: int,
    repo: TaskRepository = Depends(get_repo),
) -> dict:
    """Cancel a pending task. Running tasks cannot be cancelled."""
    success = repo.cancel(task_id)
    if not success:
        task = repo.get(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel task in status {task.status!r}. Only pending tasks can be cancelled.",
        )
    return {"cancelled": True, "task_id": task_id}
