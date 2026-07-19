"""
app/api/v1/routes/enterprise.py
Enterprise features: RBAC, Audit Logs, Compliance.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.auth.dependencies import get_current_user, require_admin
from app.auth.rbac import get_user_permissions, ROLE_PERMISSIONS
from app.models.db.user import User

router = APIRouter()


# ── RBAC ──────────────────────────────────────────────────────

@router.get("/enterprise/rbac/roles")
def list_roles(admin: User = Depends(require_admin)) -> dict:
    """List all roles and their permissions. Admin only."""
    return {
        "roles": {
            role: sorted(perms)
            for role, perms in ROLE_PERMISSIONS.items()
        }
    }


@router.get("/enterprise/rbac/my-permissions")
def my_permissions(
    current_user: User = Depends(get_current_user),
) -> dict:
    """Get permissions for the currently authenticated user."""
    return {
        "user":        current_user.username,
        "role":        current_user.role,
        "permissions": get_user_permissions(current_user),
    }


@router.put("/enterprise/rbac/users/{user_id}/role")
def set_user_role(
    user_id: int,
    role:    str,
    admin:   User    = Depends(require_admin),
    db:      Session = Depends(get_db),
) -> dict:
    """Change a user's role. Admin only."""
    valid_roles = list(ROLE_PERMISSIONS.keys())
    if role not in valid_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role {role!r}. Valid: {valid_roles}",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_role  = user.role
    user.role = role
    db.commit()

    # Audit log
    from app.auth.audit import audit_log
    audit_log(
        action="user:role_change",
        actor_name=admin.username,
        actor_id=admin.id,
        resource_type="user",
        resource_id=str(user_id),
        description=f"Changed {user.username} role: {old_role} → {role}",
    )

    return {
        "user_id":  user_id,
        "username": user.username,
        "old_role": old_role,
        "new_role": role,
    }


# ── Audit Logs ────────────────────────────────────────────────

@router.get("/enterprise/audit")
def get_audit_logs(
    limit:         int      = Query(default=50, ge=1, le=500),
    action:        str | None = Query(default=None),
    actor_name:    str | None = Query(default=None),
    resource_type: str | None = Query(default=None),
    admin:  User    = Depends(require_admin),
    db:     Session = Depends(get_db),
) -> dict:
    """Get audit log entries. Admin only."""
    from app.models.db.audit_log import AuditLog

    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action.ilike(f"%{action}%"))
    if actor_name:
        q = q.filter(AuditLog.actor_name == actor_name)
    if resource_type:
        q = q.filter(AuditLog.resource_type == resource_type)

    entries = (
        q.order_by(AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )

    return {
        "count": len(entries),
        "logs": [
            {
                "id":            e.id,
                "actor":         e.actor_name,
                "actor_type":    e.actor_type,
                "action":        e.action,
                "resource_type": e.resource_type,
                "resource_id":   e.resource_id,
                "description":   e.description,
                "success":       e.success,
                "created_at":    e.created_at.isoformat(),
            }
            for e in entries
        ],
    }


@router.get("/enterprise/compliance/report")
def compliance_report(
    admin:  User    = Depends(require_admin),
    db:     Session = Depends(get_db),
) -> dict:
    """Generate a compliance summary report. Admin only."""
    from app.models.db.audit_log import AuditLog
    from app.models.db.user import User as UserModel
    from sqlalchemy import func

    # User stats
    total_users  = db.query(func.count(UserModel.id)).scalar() or 0
    active_users = db.query(func.count(UserModel.id)).filter(UserModel.is_active).scalar() or 0
    admin_users  = db.query(func.count(UserModel.id)).filter(UserModel.is_admin).scalar() or 0

    # Audit stats
    total_actions = db.query(func.count(AuditLog.id)).scalar() or 0
    failed_actions = db.query(func.count(AuditLog.id)).filter(
        AuditLog.success == False  # noqa: E712
    ).scalar() or 0

    # Action breakdown
    action_counts = (
        db.query(AuditLog.action, func.count(AuditLog.id).label("count"))
        .group_by(AuditLog.action)
        .order_by(func.count(AuditLog.id).desc())
        .limit(10)
        .all()
    )

    return {
        "users": {
            "total":   total_users,
            "active":  active_users,
            "admins":  admin_users,
        },
        "audit": {
            "total_actions":  total_actions,
            "failed_actions": failed_actions,
            "success_rate":   round(
                (total_actions - failed_actions) / max(total_actions, 1) * 100, 1
            ),
            "top_actions": [
                {"action": r.action, "count": r.count}
                for r in action_counts
            ],
        },
    }
