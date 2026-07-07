"""
Task Manager
============
Manages the engineering backlog.

Epics → Features → Stories → Tasks → Subtasks

Every task carries machine-readable acceptance_criteria.
The Quality Engine reads these to validate completion.
The Tester Agent reads these to know what tests to run.

Auto-decomposition rule:
  When task_type in ('epic', 'feature') → trigger Planner Agent.
  This is signalled via status = 'planning' and the task event.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..00_FOUNDATION.exceptions import (
    TaskMaxRetriesExceededError,
    TaskNotFoundError,
    TaskStateTransitionError,
)
from .task_models import TaskModel, VALID_TASK_TRANSITIONS
from .project_models import ProjectModel
from .workspace_models import WorkspaceModel


class TaskManager:
    """Full implementation of task backlog management."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create_task(
        self,
        workspace_id: UUID,
        project_id: UUID,
        title: str,
        description: str = "",
        task_type: str = "story",
        acceptance_criteria: dict | None = None,
        assigned_agent: str | None = None,
        model_hint: str | None = None,
        max_retries: int = 5,
        parent_id: UUID | None = None,
    ) -> dict[str, Any]:
        # Verify workspace + project exist and are linked
        await self._verify_project_in_workspace(workspace_id, project_id)

        task = TaskModel(
            workspace_id=workspace_id,
            project_id=project_id,
            title=title,
            description=description,
            task_type=task_type,
            acceptance_criteria=acceptance_criteria or {},
            assigned_agent=assigned_agent,
            model_hint=model_hint,
            status="pending",
            retry_count=0,
            max_retries=max_retries,
            parent_id=parent_id,
        )

        self._db.add(task)
        await self._db.flush()

        # Auto-trigger planning for epic/feature types
        if task_type in ("epic", "feature"):
            task.status = "planning"
            await self._db.flush()

        return self._serialize(task)

    async def assign_task(
        self, task_id: UUID, workspace_id: UUID, assigned_agent: str
    ) -> dict[str, Any]:
        task = await self._get_or_raise(task_id, workspace_id)
        task.assigned_agent = assigned_agent
        task.updated_at = datetime.now(timezone.utc)
        await self._db.flush()
        return self._serialize(task)

    async def execute_task(
        self, task_id: UUID, workspace_id: UUID
    ) -> dict[str, Any]:
        """
        Trigger autonomous execution of a task.
        Assigns a run_group and transitions status to 'executing'.
        The actual execution is handled by the ExecutionEngine (09-EXECUTION).
        """
        task = await self._get_or_raise(task_id, workspace_id)

        if task.retry_count >= task.max_retries:
            raise TaskMaxRetriesExceededError(
                f"Task {task_id} has exceeded max retries ({task.max_retries}).",
                details={
                    "task_id": str(task_id),
                    "retry_count": task.retry_count,
                    "max_retries": task.max_retries,
                },
            )

        run_group = uuid4()
        task.run_group = run_group
        task.status = "executing"
        task.updated_at = datetime.now(timezone.utc)
        await self._db.flush()

        return {
            "task_id": task.id,
            "run_group": run_group,
            "status": "executing",
            "message": "Task queued for autonomous execution.",
        }

    async def transition_status(
        self, task_id: UUID, workspace_id: UUID, new_status: str
    ) -> dict[str, Any]:
        task = await self._get_or_raise(task_id, workspace_id)
        allowed = VALID_TASK_TRANSITIONS.get(task.status, set())

        if new_status not in allowed:
            raise TaskStateTransitionError(
                f"Cannot transition task from '{task.status}' to '{new_status}'.",
                details={
                    "task_id": str(task_id),
                    "current_status": task.status,
                    "requested_status": new_status,
                    "allowed": list(allowed),
                },
            )

        if new_status == "executing":
            task.retry_count += 1

        task.status = new_status
        task.updated_at = datetime.now(timezone.utc)
        await self._db.flush()
        return self._serialize(task)

    async def get_task_status(
        self, task_id: UUID, workspace_id: UUID
    ) -> dict[str, Any]:
        task = await self._get_or_raise(task_id, workspace_id)
        return self._serialize(task)

    async def get_task_report(
        self, task_id: UUID, workspace_id: UUID
    ) -> dict[str, Any]:
        from .builder_run_models import BuilderRunModel
        from .quality_score_models import QualityScoreModel

        task = await self._get_or_raise(task_id, workspace_id)

        runs: list[dict] = []
        quality: dict | None = None

        if task.run_group:
            runs_result = await self._db.execute(
                select(BuilderRunModel)
                .where(BuilderRunModel.run_group == task.run_group)
                .order_by(BuilderRunModel.created_at)
            )
            runs = [
                {
                    "stage": r.stage,
                    "attempt": r.attempt,
                    "is_ok": r.is_ok,
                    "duration_ms": r.duration_ms,
                    "output_preview": r.output_preview,
                    "error_message": r.error_message,
                    "created_at": r.created_at,
                }
                for r in runs_result.scalars().all()
            ]

            quality_result = await self._db.execute(
                select(QualityScoreModel)
                .where(QualityScoreModel.run_group == task.run_group)
                .order_by(QualityScoreModel.created_at.desc())
                .limit(1)
            )
            q = quality_result.scalar_one_or_none()
            if q:
                quality = {
                    "overall_score": float(q.overall_score),
                    "passed_gate": q.passed_gate,
                    "architecture_score": float(q.architecture_score),
                    "security_score": float(q.security_score),
                }

        return {
            "task": self._serialize(task),
            "execution_logs": runs,
            "quality_score": quality,
        }

    async def list_tasks(
        self,
        workspace_id: UUID,
        project_id: UUID | None = None,
        status: str | None = None,
    ) -> list[dict[str, Any]]:
        query = select(TaskModel).where(TaskModel.workspace_id == workspace_id)
        if project_id:
            query = query.where(TaskModel.project_id == project_id)
        if status:
            query = query.where(TaskModel.status == status)
        query = query.order_by(TaskModel.created_at.desc())

        result = await self._db.execute(query)
        return [self._serialize(t) for t in result.scalars().all()]

    async def _get_or_raise(self, task_id: UUID, workspace_id: UUID) -> TaskModel:
        result = await self._db.execute(
            select(TaskModel).where(
                TaskModel.id == task_id,
                TaskModel.workspace_id == workspace_id,
            )
        )
        task = result.scalar_one_or_none()
        if not task:
            raise TaskNotFoundError(
                f"Task {task_id} not found in workspace {workspace_id}.",
                details={
                    "task_id": str(task_id),
                    "workspace_id": str(workspace_id),
                },
            )
        return task

    async def _verify_project_in_workspace(
        self, workspace_id: UUID, project_id: UUID
    ) -> None:
        result = await self._db.execute(
            select(ProjectModel).where(
                ProjectModel.id == project_id,
                ProjectModel.workspace_id == workspace_id,
            )
        )
        if not result.scalar_one_or_none():
            from ..00_FOUNDATION.exceptions import ProjectNotFoundError
            raise ProjectNotFoundError(
                f"Project {project_id} not found in workspace {workspace_id}."
            )

    def _serialize(self, task: TaskModel) -> dict[str, Any]:
        return {
            "id": task.id,
            "workspace_id": task.workspace_id,
            "project_id": task.project_id,
            "title": task.title,
            "description": task.description,
            "task_type": task.task_type,
            "acceptance_criteria": task.acceptance_criteria,
            "assigned_agent": task.assigned_agent,
            "model_hint": task.model_hint,
            "status": task.status,
            "retry_count": task.retry_count,
            "max_retries": task.max_retries,
            "run_group": task.run_group,
            "parent_id": task.parent_id,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
        }
