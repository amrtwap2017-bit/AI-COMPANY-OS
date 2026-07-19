from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ._base import load_platform_file

_session  = load_platform_file("01-INFRASTRUCTURE/database/session.py")
_proj_mgr = load_platform_file("02-PLATFORM/project_mgr.py")

get_db         = _session.get_db_session
ProjectManager = _proj_mgr.ProjectManager
router = APIRouter()

@router.post("/")
async def create_project(
    workspace_id: UUID,
    name: str,
    slug: str,
    goals: str = "",
    db: AsyncSession = Depends(get_db)
):
    return await ProjectManager(db).create_project(workspace_id, name, slug, goals)

@router.get("/")
async def list_projects(
    workspace_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    return await ProjectManager(db).list_projects(workspace_id)

@router.get("/{project_id}")
async def get_project(
    workspace_id: UUID,
    project_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    return await ProjectManager(db).get_project(workspace_id, project_id)
