"""
app/auth/rbac.py
────────────────────────────────────────────────────────────────
Role-Based Access Control (RBAC).

Roles defined in User.role field:
  admin      → full access
  operator   → run agents, view all, cannot manage users
  developer  → API access, run agents, view own data
  viewer     → read-only access
  readonly   → same as viewer

Permission model:
  resource:action  e.g.  "projects:create", "users:delete"
"""

from __future__ import annotations

from fastapi import HTTPException, status
from app.models.db.user import User

# ── Role → Permissions ────────────────────────────────────────

ROLE_PERMISSIONS: dict[str, set[str]] = {
    "admin": {
        "*:*",   # all permissions
    },
    "operator": {
        "projects:*",
        "workflows:*",
        "agents:*",
        "knowledge:*",
        "chat:*",
        "memory:read",
        "benchmarks:read",
        "benchmarks:run",
        "analytics:read",
        "reflections:read",
        "decisions:read",
        "tasks:*",
        "graph:*",
    },
    "developer": {
        "projects:create", "projects:read",
        "workflows:run", "workflows:read",
        "agents:run", "agents:read",
        "knowledge:read", "knowledge:search",
        "chat:*",
        "memory:read",
        "analytics:read",
        "tasks:read", "tasks:create",
    },
    "viewer": {
        "projects:read",
        "workflows:read",
        "agents:read",
        "knowledge:read",
        "analytics:read",
        "reflections:read",
        "chat:read",
    },
    "readonly": {
        "projects:read",
        "analytics:read",
        "agents:read",
    },
}


def has_permission(user: User, permission: str) -> bool:
    """
    Check if a user has a specific permission.
    Permission format: "resource:action"
    """
    role = user.role or "viewer"
    perms = ROLE_PERMISSIONS.get(role, set())

    if "*:*" in perms:
        return True

    resource, action = permission.split(":", 1) if ":" in permission else (permission, "*")

    return (
        permission in perms
        or f"{resource}:*" in perms
        or "*:*" in perms
    )


def require_permission(permission: str):
    """
    FastAPI dependency factory for permission checks.

    Usage:
        @router.post("/projects")
        def create(user = Depends(require_permission("projects:create"))):
            ...
    """
    from fastapi import Depends
    from app.auth.dependencies import get_current_user

    def check(current_user: User = Depends(get_current_user)) -> User:
        if not has_permission(current_user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Permission denied. Required: {permission!r}. "
                    f"Your role: {current_user.role!r}"
                ),
            )
        return current_user

    return check


def get_user_permissions(user: User) -> list[str]:
    """Return all permissions for a user."""
    role  = user.role or "viewer"
    perms = ROLE_PERMISSIONS.get(role, set())
    return sorted(perms)
