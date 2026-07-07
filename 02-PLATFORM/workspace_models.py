"""
Workspace SQLAlchemy ORM Models
================================
Maps the workspace-related database tables to Python classes.
All models inherit from the shared Base.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..01_INFRASTRUCTURE.database.session import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class WorkspaceModel(Base):
    __tablename__ = "workspaces"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(Text, default="")
    lifecycle_state: Mapped[str] = mapped_column(String(50), default="CREATED")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    repos: Mapped[list[WorkspaceRepoModel]] = relationship(
        "WorkspaceRepoModel", back_populates="workspace", cascade="all, delete-orphan"
    )
    agents: Mapped[list[WorkspaceAgentModel]] = relationship(
        "WorkspaceAgentModel", back_populates="workspace", cascade="all, delete-orphan"
    )
    status_components: Mapped[list[WorkspaceStatusModel]] = relationship(
        "WorkspaceStatusModel", back_populates="workspace", cascade="all, delete-orphan"
    )


class WorkspaceRepoModel(Base):
    __tablename__ = "workspace_repos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False
    )
    git_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    branch_target: Mapped[str] = mapped_column(String(100), default="main")
    local_path: Mapped[str] = mapped_column(String(1024), default="")
    last_scanned_sha: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    workspace: Mapped[WorkspaceModel] = relationship(
        "WorkspaceModel", back_populates="repos"
    )


class WorkspaceSecretModel(Base):
    __tablename__ = "workspace_secrets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False
    )
    secret_key: Mapped[str] = mapped_column(String(255), nullable=False)
    secret_value_encrypted: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )


class WorkspaceAgentModel(Base):
    __tablename__ = "workspace_agents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False
    )
    agent_role: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    config_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )

    workspace: Mapped[WorkspaceModel] = relationship(
        "WorkspaceModel", back_populates="agents"
    )


class WorkspaceStatusModel(Base):
    __tablename__ = "workspace_status"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False
    )
    component: Mapped[str] = mapped_column(String(100), nullable=False)
    is_healthy: Mapped[bool] = mapped_column(Boolean, default=True)
    last_check: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )

    workspace: Mapped[WorkspaceModel] = relationship(
        "WorkspaceModel", back_populates="status_components"
    )
