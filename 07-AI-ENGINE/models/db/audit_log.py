"""
app/models/db/audit_log.py
────────────────────────────────────────────────────────────────
Tamper-evident audit log for all significant actions.

Every write operation should produce an audit entry.
Audit entries are NEVER deleted or updated — append-only.

Used for:
  - Security investigation
  - Compliance reporting
  - Change tracking
  - Access logs
"""

from __future__ import annotations

from sqlalchemy import String, Text, Integer, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Who did it
    actor_id:   Mapped[int | None] = mapped_column(Integer,     nullable=True)
    actor_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    actor_type: Mapped[str]        = mapped_column(String(50),  default="user")
    # user | agent | system | api_key

    # What happened
    action:      Mapped[str] = mapped_column(String(100), nullable=False)
    # create | read | update | delete | login | logout | execute | configure

    resource_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    # user | project | agent | prompt | memory | knowledge | benchmark

    resource_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Details
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    extra_data:  Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Request context
    ip_address:  Mapped[str | None] = mapped_column(String(45), nullable=True)
    request_id:  Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Outcome
    success: Mapped[bool] = mapped_column(default=True)

    __table_args__ = (
        Index("ix_audit_logs_actor",     "actor_id"),
        Index("ix_audit_logs_action",    "action"),
        Index("ix_audit_logs_resource",  "resource_type"),
        Index("ix_audit_logs_created",   "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<AuditLog id={self.id} "
            f"actor={self.actor_name!r} "
            f"action={self.action!r}>"
        )
