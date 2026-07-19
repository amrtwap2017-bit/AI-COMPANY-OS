from __future__ import annotations
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from ._base import load_platform_file, ROOT

_session  = load_platform_file("01-INFRASTRUCTURE/database/session.py")
_task_mgr = load_platform_file("02-PLATFORM/task_mgr.py")

get_db      = _session.get_db_session
TaskManager = _task_mgr.TaskManager
router = APIRouter()

@router.post("/")
async def create_task(
    workspace_id: UUID,
    project_id: UUID,
    title: str,
    task_type: str = "story",
    db: AsyncSession = Depends(get_db)
):
    return await TaskManager(db).create_task(
        workspace_id, project_id, title, task_type
    )

@router.get("/")
async def list_tasks(
    workspace_id: UUID,
    project_id: UUID | None = None,
    status: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    return await TaskManager(db).list_tasks(workspace_id, project_id, status)

@router.get("/{task_id}")
async def get_task(
    task_id: UUID,
    workspace_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    return await TaskManager(db).get_task(task_id, workspace_id)

@router.post("/{task_id}/execute")
async def execute_task(
    task_id: UUID,
    workspace_id: UUID,
    project_id: UUID,
    bg: BackgroundTasks
):
    run_group = uuid4()

    async def _run():
        engine_mod = load_platform_file("09-EXECUTION/execution_engine.py")
        engine = engine_mod.ExecutionEngine()
        await engine.run_pipeline(task_id, workspace_id, project_id, run_group)

    bg.add_task(_run)
    return {
        "status": "PIPELINE_STARTED",
        "run_group": str(run_group),
        "task_id": str(task_id)
    }

@router.patch("/{task_id}/cancel")
async def cancel_task(
    task_id: UUID,
    workspace_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    return {"cancelled": await TaskManager(db).cancel_task(task_id, workspace_id)}
