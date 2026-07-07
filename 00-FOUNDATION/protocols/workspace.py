"""
Workspace Protocol
==================
Defines the structural contract for the Workspace Manager subsystem.

Every workspace is a fully isolated execution environment. This protocol
enforces that isolation at the type level — no method operates without
an explicit workspace_id.

Anti-scope: This protocol does not define storage, execution, or
agent behaviour. It defines only the workspace boundary contract.
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Protocol, runtime_checkable
from uuid import UUID


class WorkspaceLifecycleState(str, Enum):
    """
    Ordered lifecycle states for a workspace.
    A workspace must pass through these states sequentially.
    Skipping states is a protocol violation.
    """
    CREATED = "CREATED"
    CLONING = "CLONING"
    SCANNING = "SCANNING"
    INDEXING = "INDEXING"
    WEAVING = "WEAVING"
    READY = "READY"
    SUSPENDED = "SUSPENDED"
    DELETED = "DELETED"


@runtime_checkable
class WorkspaceManagerProtocol(Protocol):
    """
    Structural contract for WorkspaceManager.

    Implementors:
        02-PLATFORM/workspace_mgr.py::WorkspaceManager

    Consumers:
        10-ENGINEERING-HUB/api/workspaces.py (REST layer)
        06-AGENTS/*.py (agents read workspace config)
        09-EXECUTION/context_packs.py (context assembly)
    """

    async def create_workspace(
        self,
        name: str,
        slug: str,
        description: str = "",
    ) -> dict[str, Any]:
        """
        Create a new isolated workspace.

        Returns:
            {
                "id": UUID,
                "name": str,
                "slug": str,
                "lifecycle_state": WorkspaceLifecycleState,
                "created_at": datetime,
            }

        Raises:
            WorkspaceSlugConflictError: if slug already exists
            WorkspaceValidationError: if slug contains invalid characters
        """
        ...

    async def delete_workspace(
        self,
        workspace_id: UUID,
    ) -> bool:
        """
        Soft-delete a workspace. Sets state to DELETED.
        Queues background cleanup of vectors, files, and memory.

        Returns:
            True if deletion was queued successfully

        Raises:
            WorkspaceNotFoundError: if workspace_id does not exist
        """
        ...

    async def import_repository(
        self,
        workspace_id: UUID,
        git_url: str,
        branch_target: str = "main",
        ssh_key_secret_id: UUID | None = None,
    ) -> UUID:
        """
        Import a Git repository into the workspace.
        Triggers: clone → scan → graph build sequence.

        Returns:
            repo_id (UUID) of the created workspace_repo record

        Raises:
            WorkspaceNotFoundError: if workspace_id does not exist
            WorkspaceNotReadyError: if workspace is not in READY state
            RepositoryCloneError: if git clone fails
        """
        ...

    async def get_workspace_status(
        self,
        workspace_id: UUID,
    ) -> dict[str, Any]:
        """
        Returns the current lifecycle state and component health.

        Returns:
            {
                "workspace_id": UUID,
                "lifecycle_state": WorkspaceLifecycleState,
                "components": [
                    {"name": str, "is_healthy": bool, "last_check": datetime}
                ],
                "repo_count": int,
                "memory_count": int,
                "vector_count": int,
            }
        """
        ...

    async def get_workspace_dashboard(
        self,
        workspace_id: UUID,
    ) -> dict[str, Any]:
        """
        Returns the full workspace summary for the dashboard.

        Returns:
            {
                "workspace": {...},
                "projects": [...],
                "active_tasks": [...],
                "recent_executions": [...],
                "agent_utilization": {...},
                "quality_trend": [...],
            }
        """
        ...

    async def transition_lifecycle_state(
        self,
        workspace_id: UUID,
        new_state: WorkspaceLifecycleState,
    ) -> bool:
        """
        Advance workspace to the next lifecycle state.
        Emits workspace.lifecycle.state_changed event.

        Raises:
            WorkspaceStateTransitionError: if transition is invalid
        """
        ...

    async def store_secret(
        self,
        workspace_id: UUID,
        secret_key: str,
        secret_value: str,
    ) -> UUID:
        """
        Encrypt and store a workspace-scoped secret.
        Uses AES-256-GCM via Fernet.

        Returns:
            secret_id (UUID)

        Raises:
            WorkspaceNotFoundError: if workspace does not exist
        """
        ...

    async def get_secret(
        self,
        workspace_id: UUID,
        secret_key: str,
    ) -> str:
        """
        Retrieve and decrypt a workspace-scoped secret.

        Raises:
            WorkspaceSecretNotFoundError: if key does not exist
            WorkspaceNotFoundError: if workspace does not exist
        """
        ...

    def validate_workspace_path(
        self,
        workspace_slug: str,
        relative_path: str,
    ) -> str:
        """
        Compute and validate a safe filesystem path within the workspace.
        Raises PermissionError on directory traversal attempts.

        Returns:
            Absolute, validated filesystem path

        Raises:
            PermissionError: if path escapes workspace boundary
        """
        ...
