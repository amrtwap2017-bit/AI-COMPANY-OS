"""
app/auth/audit.py
────────────────────────────────────────────────────────────────
Audit logging helper.

Usage anywhere in the codebase:
    from app.auth.audit import audit_log
    audit_log(
        action="project:create",
        actor_name="admin",
        resource_type="project",
        resource_id=str(project.id),
        description="Created project: Q4 Analysis",
    )
"""

from __future__ import annotations

import logging
from typing import Any

log = logging.getLogger(__name__)


def audit_log(
    action:        str,
    actor_name:    str | None   = None,
    actor_id:      int | None   = None,
    actor_type:    str          = "user",
    resource_type: str | None   = None,
    resource_id:   str | None   = None,
    description:   str | None   = None,
    extra_data:    dict | None  = None,
    ip_address:    str | None   = None,
    request_id:    str | None   = None,
    success:       bool         = True,
) -> None:
    """
    Write an audit log entry. Never raises — failures are logged.
    """
    try:
        from app.db.database import SessionLocal
        from app.models.db.audit_log import AuditLog

        db = SessionLocal()
        try:
            entry = AuditLog(
                actor_id=actor_id,
                actor_name=actor_name,
                actor_type=actor_type,
                action=action,
                resource_type=resource_type,
                resource_id=str(resource_id) if resource_id else None,
                description=description,
                extra_data=extra_data,
                ip_address=ip_address,
                request_id=request_id,
                success=success,
            )
            db.add(entry)
            db.commit()
        finally:
            db.close()

    except Exception as exc:
        log.debug("Audit log failed (non-fatal): %s", exc)
