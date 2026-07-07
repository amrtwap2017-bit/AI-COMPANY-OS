"""
Projects API Router
===================
REST endpoints for project management within workspaces.
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...01_INFRASTRUCTURE.database.session import get_db_session
from ...02_PLATFORM.project_mgr import ProjectManager
from ...00_FOUNDATION.schemas import ProjectCreate

router = APIRouter()


def get_project_manager(
    db: AsyncSession = Depends(get_db_session),
) -> ProjectManager:
    return ProjectManager(db)


@router.post(
    "/workspaces/{workspace_id}/projects",
    status_code=status.HTTP_201_CREATED,
)
async def create_project(
    workspace_id: UUID,
    body: ProjectCreate,
    mgr: ProjectManager = Depends(get_project_manager),
):
    """Create a new project within a workspace."""
    return await mgr.create_project(
        workspace_id=workspace_id,
        name=body.name,
        slug=body.slug,
        roadmap_goals=body.roadmap_goals,
    )


@router.get("/workspaces/{workspace_id}/projects")
async def list_projects(
    workspace_id: UUID,
    mgr: ProjectManager = Depends(get_project_manager),
):
    """List all projects in a workspace."""
    return await mgr.list_projects(workspace_id)


@router.get("/workspaces/{workspace_id}/projects/{project_id}")
async def get_project(
    workspace_id: UUID,
    project_id: UUID,
    mgr: ProjectManager = Depends(get_project_manager),
):
    """Get a single project."""
    return await mgr.get_project(workspace_id, project_id)


@router.get("/workspaces/{workspace_id}/projects/{project_id}/dashboard")
async def get_project_dashboard(
    workspace_id: UUID,
    project_id: UUID,
    mgr: ProjectManager = Depends(get_project_manager),
):
    """Get full project dashboard with task summary and releases."""
    return await mgr.get_project_dashboard(workspace_id, project_id)


@router.patch("/workspaces/{workspace_id}/projects/{project_id}/roadmap")
async def update_project_roadmap(
    workspace_id: UUID,
    project_id: UUID,
    roadmap_goals: str,
    mgr: ProjectManager = Depends(get_project_manager),
):
    """Update the project roadmap goals."""
    return await mgr.update_roadmap(workspace_id, project_id, roadmap_goals)


@router.post(
    "/workspaces/{workspace_id}/projects/{project_id}/releases",
    status_code=status.HTTP_201_CREATED,
)
async def create_release(
    workspace_id: UUID,
    project_id: UUID,
    version_tag: str,
    release_notes: str = "",
    mgr: ProjectManager = Depends(get_project_manager),
):
    """Create a new release for a project."""
    return await mgr.create_release(workspace_id, project_id, version_tag, release_notes)
