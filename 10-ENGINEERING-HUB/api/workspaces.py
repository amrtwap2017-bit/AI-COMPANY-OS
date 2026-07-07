"""
Workspace API Router
====================
REST endpoints for workspace lifecycle management.

All endpoints are workspace-scoped.
Every response includes the workspace_id for client-side correlation.
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...01_INFRASTRUCTURE.database.session import get_db_session
from ...02_PLATFORM.workspace_mgr import WorkspaceManager
from ...00_FOUNDATION.schemas import (
    WorkspaceCreate,
    RepoImportRequest,
)

router = APIRouter()


def get_workspace_manager(
    db: AsyncSession = Depends(get_db_session),
) -> WorkspaceManager:
    return WorkspaceManager(db)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_workspace(
    body: WorkspaceCreate,
    mgr: WorkspaceManager = Depends(get_workspace_manager),
):
    """
    Create a new isolated workspace.

    Provisions:
    - Database record with lifecycle_state=CREATED
    - Filesystem directories (repos/, knowledge/, memory/, artifacts/)
    - Default agent role assignments (10 roles)
    - Health status components (4 components)
    """
    return await mgr.create_workspace(
        name=body.name,
        slug=body.slug,
        description=body.description,
    )


@router.delete("/{workspace_id}", status_code=status.HTTP_202_ACCEPTED)
async def delete_workspace(
    workspace_id: UUID,
    mgr: WorkspaceManager = Depends(get_workspace_manager),
):
    """
    Soft-delete a workspace. Sets lifecycle_state to DELETED.
    Background cleanup of vectors, files, and memory is queued.
    """
    await mgr.delete_workspace(workspace_id)
    return {
        "message": "Workspace queued for termination.",
        "workspace_id": workspace_id,
    }


@router.post("/{workspace_id}/repos", status_code=status.HTTP_201_CREATED)
async def import_repository(
    workspace_id: UUID,
    body: RepoImportRequest,
    mgr: WorkspaceManager = Depends(get_workspace_manager),
):
    """
    Register a Git repository into the workspace.
    Creates the database record. Git clone is triggered asynchronously.
    """
    repo_id = await mgr.import_repository(
        workspace_id=workspace_id,
        git_url=body.git_url,
        branch_target=body.branch_target,
    )
    return {
        "repo_id": repo_id,
        "workspace_id": workspace_id,
        "git_url": body.git_url,
        "status": "REGISTERED",
        "message": "Repository registered. Clone will be triggered on next sync.",
    }


@router.post("/{workspace_id}/docs", status_code=status.HTTP_202_ACCEPTED)
async def import_documentation(
    workspace_id: UUID,
):
    """
    Import documentation into the workspace knowledge base.
    Full implementation in Wave 2 (Knowledge Manager).
    """
    return {
        "workspace_id": workspace_id,
        "status": "ACCEPTED",
        "message": "Documentation ingestion queued. (Wave 2: Knowledge Manager)",
    }


@router.post("/{workspace_id}/knowledge", status_code=status.HTTP_202_ACCEPTED)
async def trigger_knowledge_indexing(
    workspace_id: UUID,
):
    """
    Trigger full knowledge graph rebuild for the workspace.
    Full implementation in Wave 2 (Knowledge Manager).
    """
    return {
        "workspace_id": workspace_id,
        "status": "INDEXING_TRIGGERED",
        "message": "Knowledge indexing queued. (Wave 2: Knowledge Manager)",
    }


@router.get("/{workspace_id}/status")
async def get_workspace_status(
    workspace_id: UUID,
    mgr: WorkspaceManager = Depends(get_workspace_manager),
):
    """Return the current lifecycle state and component health."""
    return await mgr.get_workspace_status(workspace_id)


@router.get("/{workspace_id}/dashboard")
async def get_workspace_dashboard(
    workspace_id: UUID,
    mgr: WorkspaceManager = Depends(get_workspace_manager),
):
    """Return the full workspace summary for the dashboard."""
    return await mgr.get_workspace_dashboard(workspace_id)


@router.patch("/{workspace_id}/lifecycle")
async def transition_workspace_state(
    workspace_id: UUID,
    new_state: str,
    mgr: WorkspaceManager = Depends(get_workspace_manager),
):
    """
    Advance workspace lifecycle state.
    Valid transitions: CREATED→CLONING→SCANNING→INDEXING→WEAVING→READY
    """
    from ...00_FOUNDATION.protocols.workspace import WorkspaceLifecycleState
    state = WorkspaceLifecycleState(new_state.upper())
    await mgr.transition_lifecycle_state(workspace_id, state)
    return {
        "workspace_id": workspace_id,
        "new_state": state.value,
        "status": "TRANSITIONED",
    }


@router.post("/{workspace_id}/secrets", status_code=status.HTTP_201_CREATED)
async def store_workspace_secret(
    workspace_id: UUID,
    secret_key: str,
    secret_value: str,
    mgr: WorkspaceManager = Depends(get_workspace_manager),
):
    """Store an encrypted secret in the workspace secret vault."""
    secret_id = await mgr.store_secret(workspace_id, secret_key, secret_value)
    return {"secret_id": secret_id, "workspace_id": workspace_id, "key": secret_key}
