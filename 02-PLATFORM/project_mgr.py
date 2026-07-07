"""
Project Manager
===============
Manages projects within a workspace.

A project is the unit of work within a workspace.
It contains repositories, tasks, releases, and milestones.
Every project is workspace-scoped — no cross-workspace project access.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..00_FOUNDATION.exceptions import (
    ProjectNotFoundError,
    ProjectSlugConflictError,
    WorkspaceNotFoundError,
)
from .project_models import ProjectModel, ProjectReleaseModel
from .workspace_models import WorkspaceModel


class ProjectManager:
    """Full implementation for project lifecycle management."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create_project(
        self,
        workspace_id: UUID,
        name: str,
        slug: str,
        roadmap_goals: str = "",
    ) -> dict[str, Any]:
        # Verify workspace exists
        ws_result = await self._db.execute(
            select(WorkspaceModel).where(WorkspaceModel.id == workspace_id)
        )
        if not ws_result.scalar_one_or_none():
            raise WorkspaceNotFoundError(
                f"Workspace {workspace_id} not found.",
                details={"workspace_id": str(workspace_id)},
            )

        project = ProjectModel(
            workspace_id=workspace_id,
            name=name,
            slug=slug.lower().strip(),
            roadmap_goals=roadmap_goals,
        )

        try:
            self._db.add(project)
            await self._db.flush()
        except IntegrityError:
            await self._db.rollback()
            raise ProjectSlugConflictError(
                f"Project slug '{slug}' already exists in workspace {workspace_id}.",
                details={"slug": slug, "workspace_id": str(workspace_id)},
            )

        return {
            "id": project.id,
            "workspace_id": project.workspace_id,
            "name": project.name,
            "slug": project.slug,
            "roadmap_goals": project.roadmap_goals,
            "created_at": project.created_at,
        }

    async def list_projects(self, workspace_id: UUID) -> list[dict[str, Any]]:
        result = await self._db.execute(
            select(ProjectModel)
            .where(ProjectModel.workspace_id == workspace_id)
            .order_by(ProjectModel.created_at.desc())
        )
        projects = result.scalars().all()
        return [
            {
                "id": p.id,
                "workspace_id": p.workspace_id,
                "name": p.name,
                "slug": p.slug,
                "roadmap_goals": p.roadmap_goals,
                "created_at": p.created_at,
            }
            for p in projects
        ]

    async def get_project(
        self, workspace_id: UUID, project_id: UUID
    ) -> dict[str, Any]:
        project = await self._get_or_raise(workspace_id, project_id)
        return {
            "id": project.id,
            "workspace_id": project.workspace_id,
            "name": project.name,
            "slug": project.slug,
            "roadmap_goals": project.roadmap_goals,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
        }

    async def get_project_dashboard(
        self, workspace_id: UUID, project_id: UUID
    ) -> dict[str, Any]:
        from .task_models import TaskModel

        project = await self._get_or_raise(workspace_id, project_id)

        tasks_result = await self._db.execute(
            select(TaskModel).where(
                TaskModel.project_id == project_id,
                TaskModel.workspace_id == workspace_id,
            )
        )
        tasks = tasks_result.scalars().all()

        by_status: dict[str, int] = {}
        for task in tasks:
            by_status[task.status] = by_status.get(task.status, 0) + 1

        releases_result = await self._db.execute(
            select(ProjectReleaseModel)
            .where(ProjectReleaseModel.project_id == project_id)
            .order_by(ProjectReleaseModel.created_at.desc())
            .limit(5)
        )
        releases = releases_result.scalars().all()

        return {
            "project_id": project.id,
            "name": project.name,
            "slug": project.slug,
            "roadmap_goals": project.roadmap_goals,
            "task_summary": {
                "total": len(tasks),
                "by_status": by_status,
            },
            "recent_releases": [
                {
                    "id": r.id,
                    "version_tag": r.version_tag,
                    "released_at": r.released_at,
                }
                for r in releases
            ],
        }

    async def update_roadmap(
        self, workspace_id: UUID, project_id: UUID, roadmap_goals: str
    ) -> dict[str, Any]:
        project = await self._get_or_raise(workspace_id, project_id)
        project.roadmap_goals = roadmap_goals
        project.updated_at = datetime.now(timezone.utc)
        await self._db.flush()
        return {"status": "ROADMAP_UPDATED", "project_id": project.id}

    async def create_release(
        self,
        workspace_id: UUID,
        project_id: UUID,
        version_tag: str,
        release_notes: str = "",
    ) -> dict[str, Any]:
        project = await self._get_or_raise(workspace_id, project_id)
        release = ProjectReleaseModel(
            project_id=project.id,
            version_tag=version_tag,
            release_notes=release_notes,
            released_at=datetime.now(timezone.utc),
        )
        self._db.add(release)
        await self._db.flush()
        return {
            "id": release.id,
            "project_id": release.project_id,
            "version_tag": release.version_tag,
            "released_at": release.released_at,
        }

    async def _get_or_raise(
        self, workspace_id: UUID, project_id: UUID
    ) -> ProjectModel:
        result = await self._db.execute(
            select(ProjectModel).where(
                ProjectModel.id == project_id,
                ProjectModel.workspace_id == workspace_id,
            )
        )
        project = result.scalar_one_or_none()
        if not project:
            raise ProjectNotFoundError(
                f"Project {project_id} not found in workspace {workspace_id}.",
                details={
                    "project_id": str(project_id),
                    "workspace_id": str(workspace_id),
                },
            )
        return project
