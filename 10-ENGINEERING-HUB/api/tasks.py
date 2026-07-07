"""
Tasks API Router
================
REST endpoints for engineering task backlog management.

Tasks are the atomic unit of autonomous execution.
Every POST /tasks/{id}/execute triggers the full autonomous pipeline.
"""

from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...01_INFRASTRUCTURE.database.session import get_db_session
from ...02_PLATFORM.task_mgr import TaskManager
from ...00_FOUNDATION.schemas import TaskCreate

router = APIRouter()


def get_task_manager(
    db: AsyncSession = Depends(get_db_session),
) -> TaskManager:
    return TaskManager(db)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_task(
    body: TaskCreate,
    mgr: TaskManager = Depends(get_task_manager),
):
    """
    Create a new engineering task.

    task_type options: epic, feature, story, task, subtask, bug, spike

    Auto-decomposition: epic and feature types are automatically
    set to status=planning and trigger the Planner Agent (Wave 2).

    acceptance_criteria is machine-readable and used by:
    - Tester Agent: knows which tests to run
    - Quality Engine: knows the quality thresholds
    - Reviewer Agent: knows what to validate
    """
    return await mgr.create_task(
        workspace_id=body.workspace_id,
        project_id=body.project_id,
        title=body.title,
        description=body.description,
        task_type=body.task_type,
        acceptance_criteria=body.acceptance_criteria.model_dump(),
        assigned_agent=body.assigned_agent,
        model_hint=body.model_hint,
        max_retries=body.max_retries,
        parent_id=body.parent_id,
    )


@router.get("")
async def list_tasks(
    workspace_id: UUID = Query(..., description="Filter by workspace"),
    project_id: Optional[UUID] = Query(None, description="Filter by project"),
    status: Optional[str] = Query(None, description="Filter by status"),
    mgr: TaskManager = Depends(get_task_manager),
):
    """List tasks with optional filters."""
    return await mgr.list_tasks(
        workspace_id=workspace_id,
        project_id=project_id,
        status=status,
    )


@router.post("/{task_id}/assign")
async def assign_task(
    task_id: UUID,
    workspace_id: UUID = Query(...),
    assigned_agent: str = Query(...),
    mgr: TaskManager = Depends(get_task_manager),
):
    """Assign an agent role to a task."""
    return await mgr.assign_task(task_id, workspace_id, assigned_agent)


@router.post("/{task_id}/execute", status_code=status.HTTP_202_ACCEPTED)
async def execute_task(
    task_id: UUID,
    workspace_id: UUID = Query(...),
    mgr: TaskManager = Depends(get_task_manager),
):
    """
    Trigger autonomous execution of a task.

    This is the primary entry point for the autonomous engineering pipeline.

    What happens:
    1. Assigns run_group UUID for full correlation
    2. Sets status to 'executing'
    3. ExecutionEngine picks up the task (Wave 3)
    4. Context Pack assembled
    5. Planner → Architect → Developer → Tester → Reviewer → Git
    6. Quality Gate evaluated
    7. If passed: commit + release notes
    8. Memory updated with execution results

    Current: Wave 1 — assigns run_group, sets status
    Wave 3: Full autonomous pipeline activated
    """
    return await mgr.execute_task(task_id, workspace_id)


@router.get("/{task_id}/status")
async def get_task_status(
    task_id: UUID,
    workspace_id: UUID = Query(...),
    mgr: TaskManager = Depends(get_task_manager),
):
    """Get current task status and metadata."""
    return await mgr.get_task_status(task_id, workspace_id)


@router.get("/{task_id}/report")
async def get_task_report(
    task_id: UUID,
    workspace_id: UUID = Query(...),
    mgr: TaskManager = Depends(get_task_manager),
):
    """
    Get the full execution report for a task.
    Includes: all builder_run stages, quality scores, and agent outputs.
    """
    return await mgr.get_task_report(task_id, workspace_id)


@router.patch("/{task_id}/status")
async def transition_task_status(
    task_id: UUID,
    workspace_id: UUID = Query(...),
    new_status: str = Query(...),
    mgr: TaskManager = Depends(get_task_manager),
):
    """Manually transition a task status (for admin/override use)."""
    return await mgr.transition_status(task_id, workspace_id, new_status)
