from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ._base import load_platform_file

_session = load_platform_file("01-INFRASTRUCTURE/database/session.py")
_ws_mgr  = load_platform_file("02-PLATFORM/workspace_mgr.py")

get_db           = _session.get_db_session
WorkspaceManager = _ws_mgr.WorkspaceManager
router = APIRouter()

@router.post("/")
async def create_workspace(
    name: str,
    slug: str,
    description: str = "",
    db: AsyncSession = Depends(get_db)
):
    return await WorkspaceManager(db).create_workspace(
        name=name, slug=slug, description=description
    )

@router.get("/{workspace_id}")
async def get_workspace(
    workspace_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    return await WorkspaceManager(db).get_workspace_status(workspace_id)

@router.get("/{workspace_id}/dashboard")
async def get_dashboard(
    workspace_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    return await WorkspaceManager(db).get_workspace_dashboard(workspace_id)

@router.post("/{workspace_id}/repos")
async def import_repo(
    workspace_id: UUID,
    git_url: str,
    branch: str = "main",
    db: AsyncSession = Depends(get_db)
):
    repo_id = await WorkspaceManager(db).import_repository(
        workspace_id, git_url, branch
    )
    return {"repo_id": repo_id, "status": "IMPORT_INITIALIZED"}

@router.delete("/{workspace_id}")
async def delete_workspace(
    workspace_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    success = await WorkspaceManager(db).delete_workspace(workspace_id)
    return {"success": success, "state": "DELETED"}
