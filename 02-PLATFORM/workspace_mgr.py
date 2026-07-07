"""
Workspace Manager
=================
Implements WorkspaceManagerProtocol.

Owns the complete workspace lifecycle:
  CREATED → CLONING → SCANNING → INDEXING → WEAVING → READY

Every method is workspace-scoped. No method operates without
a verified workspace_id. Directory traversal is blocked at the
path validation layer before any filesystem operation executes.

Dependencies (imports only from lower layers):
  00-FOUNDATION: protocols, schemas, exceptions
  01-INFRASTRUCTURE: database session
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import UUID, uuid4

from cryptography.fernet import Fernet
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..00_FOUNDATION.exceptions import (
    WorkspaceBoundaryViolationError,
    WorkspaceNotFoundError,
    WorkspaceNotReadyError,
    WorkspaceSecretNotFoundError,
    WorkspaceSlugConflictError,
    WorkspaceStateTransitionError,
)
from ..00_FOUNDATION.protocols.workspace import WorkspaceLifecycleState
from ..00_FOUNDATION.schemas import WorkspaceCreate, WorkspaceResponse
from .workspace_models import (
    WorkspaceAgentModel,
    WorkspaceModel,
    WorkspaceRepoModel,
    WorkspaceSecretModel,
    WorkspaceStatusModel,
)

# ─── Valid State Transitions ───────────────────────────────────────────────────

_VALID_TRANSITIONS: dict[WorkspaceLifecycleState, set[WorkspaceLifecycleState]] = {
    WorkspaceLifecycleState.CREATED: {WorkspaceLifecycleState.CLONING},
    WorkspaceLifecycleState.CLONING: {WorkspaceLifecycleState.SCANNING},
    WorkspaceLifecycleState.SCANNING: {WorkspaceLifecycleState.INDEXING},
    WorkspaceLifecycleState.INDEXING: {WorkspaceLifecycleState.WEAVING},
    WorkspaceLifecycleState.WEAVING: {WorkspaceLifecycleState.READY},
    WorkspaceLifecycleState.READY: {WorkspaceLifecycleState.SUSPENDED},
    WorkspaceLifecycleState.SUSPENDED: {
        WorkspaceLifecycleState.READY,
        WorkspaceLifecycleState.DELETED,
    },
    WorkspaceLifecycleState.DELETED: set(),
}

# ─── Default Agent Roles provisioned for every new workspace ──────────────────

_DEFAULT_AGENT_ROLES = [
    "planner",
    "architect",
    "developer",
    "tester",
    "reviewer",
    "security",
    "git",
    "memory",
    "knowledge",
    "documentation",
]


class WorkspaceManager:
    """
    Full implementation of WorkspaceManagerProtocol.

    Injected via FastAPI Depends() in the API layer.
    Agents reference this through the WorkspaceManagerProtocol interface.
    """

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._workspace_base = Path(
            os.environ.get(
                "WORKSPACE_BASE_PATH",
                str(Path.home() / "AI-COMPANY-OS" / "11-WORKSPACES"),
            )
        )
        self._fernet = Fernet(
            os.environ.get("ENCRYPTION_MASTER_KEY", Fernet.generate_key())
        )

    # ─── Create ───────────────────────────────────────────────────────────────

    async def create_workspace(
        self,
        name: str,
        slug: str,
        description: str = "",
    ) -> dict[str, Any]:
        """
        Create a new isolated workspace record and provision its directory.
        """
        # Validate slug format
        import re
        if not re.match(r"^[a-z0-9-]+$", slug):
            from ..00_FOUNDATION.exceptions import WorkspaceValidationError
            raise WorkspaceValidationError(
                f"Slug '{slug}' is invalid. Use only lowercase letters, numbers, hyphens."
            )

        workspace = WorkspaceModel(
            name=name,
            slug=slug,
            description=description,
            lifecycle_state=WorkspaceLifecycleState.CREATED.value,
        )

        try:
            self._db.add(workspace)
            await self._db.flush()
        except IntegrityError:
            await self._db.rollback()
            raise WorkspaceSlugConflictError(
                f"A workspace with slug '{slug}' already exists.",
                details={"slug": slug},
            )

        # Provision filesystem directory
        workspace_dir = self._workspace_base / slug
        workspace_dir.mkdir(parents=True, exist_ok=True)
        (workspace_dir / "repos").mkdir(exist_ok=True)
        (workspace_dir / "knowledge").mkdir(exist_ok=True)
        (workspace_dir / "memory").mkdir(exist_ok=True)
        (workspace_dir / "artifacts").mkdir(exist_ok=True)

        # Provision default workspace status components
        for component in ["VECTOR_STORE", "GRAPH_DB", "FILE_SYSTEM", "MEMORY"]:
            status = WorkspaceStatusModel(
                workspace_id=workspace.id,
                component=component,
                is_healthy=True,
            )
            self._db.add(status)

        # Provision default agent roles
        for role in _DEFAULT_AGENT_ROLES:
            agent = WorkspaceAgentModel(
                workspace_id=workspace.id,
                agent_role=role,
                is_active=True,
                config_json={},
            )
            self._db.add(agent)

        await self._db.flush()

        return {
            "id": workspace.id,
            "name": workspace.name,
            "slug": workspace.slug,
            "description": workspace.description,
            "lifecycle_state": workspace.lifecycle_state,
            "created_at": workspace.created_at,
            "workspace_path": str(workspace_dir),
        }

    # ─── Delete ───────────────────────────────────────────────────────────────

    async def delete_workspace(self, workspace_id: UUID) -> bool:
        """Soft-delete: sets lifecycle_state to DELETED."""
        workspace = await self._get_or_raise(workspace_id)
        workspace.lifecycle_state = WorkspaceLifecycleState.DELETED.value
        workspace.updated_at = datetime.now(timezone.utc)
        await self._db.flush()
        return True

    # ─── Import Repository ────────────────────────────────────────────────────

    async def import_repository(
        self,
        workspace_id: UUID,
        git_url: str,
        branch_target: str = "main",
        ssh_key_secret_id: UUID | None = None,
    ) -> UUID:
        """
        Register a repository for this workspace.
        Actual git clone is handled by the RepositoryManager (03-KNOWLEDGE).
        This method creates the database record and returns the repo_id.
        """
        workspace = await self._get_or_raise(workspace_id)

        workspace_dir = self._workspace_base / workspace.slug
        repo_slug = git_url.rstrip("/").split("/")[-1].replace(".git", "")
        local_path = str(workspace_dir / "repos" / repo_slug)

        repo = WorkspaceRepoModel(
            workspace_id=workspace_id,
            git_url=git_url,
            branch_target=branch_target,
            local_path=local_path,
        )

        try:
            self._db.add(repo)
            await self._db.flush()
        except IntegrityError:
            await self._db.rollback()
            # Repository already registered — return existing
            result = await self._db.execute(
                select(WorkspaceRepoModel).where(
                    WorkspaceRepoModel.workspace_id == workspace_id,
                    WorkspaceRepoModel.git_url == git_url,
                )
            )
            existing = result.scalar_one()
            return existing.id

        return repo.id

    # ─── Status ───────────────────────────────────────────────────────────────

    async def get_workspace_status(self, workspace_id: UUID) -> dict[str, Any]:
        workspace = await self._get_or_raise(workspace_id)

        status_result = await self._db.execute(
            select(WorkspaceStatusModel).where(
                WorkspaceStatusModel.workspace_id == workspace_id
            )
        )
        components = status_result.scalars().all()

        repo_result = await self._db.execute(
            select(WorkspaceRepoModel).where(
                WorkspaceRepoModel.workspace_id == workspace_id
            )
        )
        repos = repo_result.scalars().all()

        return {
            "workspace_id": workspace.id,
            "lifecycle_state": workspace.lifecycle_state,
            "components": [
                {
                    "name": c.component,
                    "is_healthy": c.is_healthy,
                    "last_check": c.last_check,
                }
                for c in components
            ],
            "repo_count": len(repos),
            "memory_count": 0,
            "vector_count": 0,
        }

    # ─── Dashboard ────────────────────────────────────────────────────────────

    async def get_workspace_dashboard(self, workspace_id: UUID) -> dict[str, Any]:
        workspace = await self._get_or_raise(workspace_id)

        from .project_models import ProjectModel
        from .task_models import TaskModel

        projects_result = await self._db.execute(
            select(ProjectModel).where(
                ProjectModel.workspace_id == workspace_id
            )
        )
        projects = projects_result.scalars().all()

        active_tasks_result = await self._db.execute(
            select(TaskModel).where(
                TaskModel.workspace_id == workspace_id,
                TaskModel.status.in_(["pending", "planning", "executing", "reviewing"]),
            )
        )
        active_tasks = active_tasks_result.scalars().all()

        return {
            "workspace": {
                "id": workspace.id,
                "name": workspace.name,
                "slug": workspace.slug,
                "lifecycle_state": workspace.lifecycle_state,
            },
            "projects": [
                {"id": p.id, "name": p.name, "slug": p.slug}
                for p in projects
            ],
            "active_tasks": [
                {
                    "id": t.id,
                    "title": t.title,
                    "status": t.status,
                    "assigned_agent": t.assigned_agent,
                }
                for t in active_tasks
            ],
            "statistics": {
                "project_count": len(projects),
                "active_task_count": len(active_tasks),
            },
        }

    # ─── Lifecycle Transition ─────────────────────────────────────────────────

    async def transition_lifecycle_state(
        self,
        workspace_id: UUID,
        new_state: WorkspaceLifecycleState,
    ) -> bool:
        workspace = await self._get_or_raise(workspace_id)
        current = WorkspaceLifecycleState(workspace.lifecycle_state)

        allowed = _VALID_TRANSITIONS.get(current, set())
        if new_state not in allowed:
            raise WorkspaceStateTransitionError(
                f"Cannot transition from {current.value} to {new_state.value}.",
                details={
                    "current_state": current.value,
                    "requested_state": new_state.value,
                    "allowed_transitions": [s.value for s in allowed],
                },
            )

        workspace.lifecycle_state = new_state.value
        workspace.updated_at = datetime.now(timezone.utc)
        await self._db.flush()
        return True

    # ─── Secrets ──────────────────────────────────────────────────────────────

    async def store_secret(
        self,
        workspace_id: UUID,
        secret_key: str,
        secret_value: str,
    ) -> UUID:
        await self._get_or_raise(workspace_id)

        encrypted = self._fernet.encrypt(secret_value.encode()).decode()

        secret = WorkspaceSecretModel(
            workspace_id=workspace_id,
            secret_key=secret_key,
            secret_value_encrypted=encrypted,
        )
        self._db.add(secret)
        await self._db.flush()
        return secret.id

    async def get_secret(self, workspace_id: UUID, secret_key: str) -> str:
        await self._get_or_raise(workspace_id)

        result = await self._db.execute(
            select(WorkspaceSecretModel).where(
                WorkspaceSecretModel.workspace_id == workspace_id,
                WorkspaceSecretModel.secret_key == secret_key,
            )
        )
        secret = result.scalar_one_or_none()
        if not secret:
            raise WorkspaceSecretNotFoundError(
                f"Secret '{secret_key}' not found in workspace {workspace_id}."
            )

        return self._fernet.decrypt(secret.secret_value_encrypted.encode()).decode()

    # ─── Path Validation ──────────────────────────────────────────────────────

    def validate_workspace_path(
        self,
        workspace_slug: str,
        relative_path: str,
    ) -> str:
        """
        Compute and validate a safe filesystem path.
        Raises PermissionError on directory traversal.
        """
        base = (self._workspace_base / workspace_slug).resolve()
        target = (base / relative_path).resolve()

        if not str(target).startswith(str(base)):
            raise WorkspaceBoundaryViolationError(
                attempted_path=str(target),
                workspace_slug=workspace_slug,
            )
        return str(target)

    # ─── Internal ─────────────────────────────────────────────────────────────

    async def _get_or_raise(self, workspace_id: UUID) -> WorkspaceModel:
        result = await self._db.execute(
            select(WorkspaceModel).where(WorkspaceModel.id == workspace_id)
        )
        workspace = result.scalar_one_or_none()
        if not workspace:
            raise WorkspaceNotFoundError(
                f"Workspace {workspace_id} does not exist.",
                details={"workspace_id": str(workspace_id)},
            )
        return workspace
