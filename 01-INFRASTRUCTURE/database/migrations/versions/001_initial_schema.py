"""Initial platform schema

Revision ID: 001
Revises:
Create Date: 2026-07-06

Creates the complete Wave 1 schema:
- workspaces
- workspace_repos
- workspace_secrets
- workspace_agents
- workspace_models
- workspace_status
- projects
- project_repos
- project_releases
- repo_branches
- repo_commits
- repo_ownership
- tasks
- task_dependencies
- builder_runs
- quality_scores
- memories
- memory_tags
- memory_links
- tool_audit_log
- model_usage_log
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:

    # ── Enable Extensions ─────────────────────────────────────────────────────
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "vector"')

    # ── workspaces ────────────────────────────────────────────────────────────
    op.create_table(
        "workspaces",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column("name", sa.String(255), nullable=False, unique=True),
        sa.Column("slug", sa.String(100), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True, default=""),
        sa.Column(
            "lifecycle_state",
            sa.String(50),
            nullable=False,
            server_default="CREATED",
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("idx_workspaces_slug", "workspaces", ["slug"])
    op.create_index(
        "idx_workspaces_lifecycle_state", "workspaces", ["lifecycle_state"]
    )

    # ── workspace_repos ───────────────────────────────────────────────────────
    op.create_table(
        "workspace_repos",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("git_url", sa.String(1024), nullable=False),
        sa.Column("branch_target", sa.String(100), server_default="main"),
        sa.Column("local_path", sa.String(1024), nullable=False),
        sa.Column("last_scanned_sha", sa.String(64), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.UniqueConstraint("workspace_id", "git_url", name="uq_workspace_repo"),
    )
    op.create_index(
        "idx_workspace_repos_workspace", "workspace_repos", ["workspace_id"]
    )

    # ── workspace_secrets ─────────────────────────────────────────────────────
    op.create_table(
        "workspace_secrets",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("secret_key", sa.String(255), nullable=False),
        sa.Column("secret_value_encrypted", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.UniqueConstraint(
            "workspace_id", "secret_key", name="uq_workspace_secret_key"
        ),
    )

    # ── workspace_agents ──────────────────────────────────────────────────────
    op.create_table(
        "workspace_agents",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("agent_role", sa.String(100), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("config_json", postgresql.JSONB(), server_default="{}"),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.UniqueConstraint(
            "workspace_id", "agent_role", name="uq_workspace_agent"
        ),
    )

    # ── workspace_models ──────────────────────────────────────────────────────
    op.create_table(
        "workspace_models",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("task_type", sa.String(100), nullable=False),
        sa.Column("model_id", sa.String(255), nullable=False),
        sa.Column("provider", sa.String(100), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.UniqueConstraint(
            "workspace_id", "task_type", name="uq_workspace_model_task"
        ),
    )

    # ── workspace_status ──────────────────────────────────────────────────────
    op.create_table(
        "workspace_status",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("component", sa.String(100), nullable=False),
        sa.Column("is_healthy", sa.Boolean(), server_default="true"),
        sa.Column(
            "last_check",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index(
        "idx_workspace_status_workspace", "workspace_status", ["workspace_id"]
    )

    # ── projects ──────────────────────────────────────────────────────────────
    op.create_table(
        "projects",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False),
        sa.Column("roadmap_goals", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.UniqueConstraint(
            "workspace_id", "slug", name="uq_workspace_project_slug"
        ),
    )
    op.create_index("idx_projects_workspace", "projects", ["workspace_id"])

    # ── project_repos ─────────────────────────────────────────────────────────
    op.create_table(
        "project_repos",
        sa.Column(
            "project_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "repo_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspace_repos.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.PrimaryKeyConstraint("project_id", "repo_id"),
    )

    # ── project_releases ──────────────────────────────────────────────────────
    op.create_table(
        "project_releases",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "project_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("version_tag", sa.String(50), nullable=False),
        sa.Column("release_notes", sa.Text(), nullable=True),
        sa.Column("released_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index(
        "idx_project_releases_project", "project_releases", ["project_id"]
    )

    # ── repo_branches ─────────────────────────────────────────────────────────
    op.create_table(
        "repo_branches",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "repo_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspace_repos.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("is_default", sa.Boolean(), server_default="false"),
        sa.Column("last_commit_sha", sa.String(64), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.UniqueConstraint("repo_id", "name", name="uq_repo_branch"),
    )

    # ── repo_commits ──────────────────────────────────────────────────────────
    op.create_table(
        "repo_commits",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "repo_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspace_repos.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("sha", sa.String(64), nullable=False),
        sa.Column("author_name", sa.String(255), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("committed_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.UniqueConstraint("repo_id", "sha", name="uq_repo_commit_sha"),
    )
    op.create_index("idx_repo_commits_repo", "repo_commits", ["repo_id"])

    # ── repo_ownership ────────────────────────────────────────────────────────
    op.create_table(
        "repo_ownership",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "repo_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspace_repos.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("file_path_pattern", sa.String(1024), nullable=False),
        sa.Column("agent_role", sa.String(100), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )

    # ── tasks ─────────────────────────────────────────────────────────────────
    op.create_table(
        "tasks",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "project_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("task_type", sa.String(50), server_default="story"),
        sa.Column(
            "acceptance_criteria",
            postgresql.JSONB(),
            server_default="{}",
        ),
        sa.Column("assigned_agent", sa.String(100), nullable=True),
        sa.Column("model_hint", sa.String(100), nullable=True),
        sa.Column("status", sa.String(50), server_default="pending", nullable=False),
        sa.Column("retry_count", sa.Integer(), server_default="0"),
        sa.Column("max_retries", sa.Integer(), server_default="5"),
        sa.Column("run_group", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "parent_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tasks.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("idx_tasks_workspace", "tasks", ["workspace_id"])
    op.create_index("idx_tasks_project", "tasks", ["project_id"])
    op.create_index("idx_tasks_run_group", "tasks", ["run_group"])
    op.create_index("idx_tasks_status", "tasks", ["status"])
    op.create_index("idx_tasks_assigned_agent", "tasks", ["assigned_agent"])

    # ── task_dependencies ─────────────────────────────────────────────────────
    op.create_table(
        "task_dependencies",
        sa.Column(
            "task_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tasks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "depends_on_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tasks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("task_id", "depends_on_id"),
    )

    # ── builder_runs ──────────────────────────────────────────────────────────
    op.create_table(
        "builder_runs",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "project_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "task_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tasks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("run_group", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("stage", sa.String(50), nullable=False),
        sa.Column("attempt", sa.Integer(), server_default="1"),
        sa.Column("is_ok", sa.Boolean(), server_default="true"),
        sa.Column("duration_ms", sa.Integer(), nullable=False),
        sa.Column("output_preview", sa.Text(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("idx_builder_runs_group", "builder_runs", ["run_group"])
    op.create_index("idx_builder_runs_task", "builder_runs", ["task_id"])
    op.create_index("idx_builder_runs_workspace", "builder_runs", ["workspace_id"])

    # ── quality_scores ────────────────────────────────────────────────────────
    op.create_table(
        "quality_scores",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column("run_group", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("architecture_score", sa.Numeric(5, 2), nullable=False),
        sa.Column("security_score", sa.Numeric(5, 2), nullable=False),
        sa.Column("performance_score", sa.Numeric(5, 2), nullable=False),
        sa.Column("test_coverage_score", sa.Numeric(5, 2), nullable=False),
        sa.Column("code_smells_score", sa.Numeric(5, 2), nullable=False),
        sa.Column("doc_completeness_score", sa.Numeric(5, 2), nullable=False),
        sa.Column("hallucination_index", sa.Numeric(5, 2), nullable=False),
        sa.Column("overall_score", sa.Numeric(5, 2), nullable=False),
        sa.Column("passed_gate", sa.Boolean(), server_default="false"),
        sa.Column("feedback_details", postgresql.JSONB(), server_default="{}"),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("idx_quality_scores_group", "quality_scores", ["run_group"])

    # ── memories ──────────────────────────────────────────────────────────────
    op.create_table(
        "memories",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "project_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("projects.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("memory_type", sa.String(50), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("expires_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index(
        "idx_memories_workspace_type", "memories", ["workspace_id", "memory_type"]
    )
    op.create_index("idx_memories_expires", "memories", ["expires_at"])

    # ── memory_tags ───────────────────────────────────────────────────────────
    op.create_table(
        "memory_tags",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "memory_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("memories.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("tag", sa.String(100), nullable=False),
    )
    op.create_index("idx_memory_tags_memory", "memory_tags", ["memory_id"])
    op.create_index("idx_memory_tags_tag", "memory_tags", ["tag"])

    # ── memory_links ──────────────────────────────────────────────────────────
    op.create_table(
        "memory_links",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "source_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("memories.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "target_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("memories.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("relation_type", sa.String(100), nullable=False),
        sa.UniqueConstraint(
            "source_id", "target_id", "relation_type",
            name="uq_memory_link"
        ),
    )

    # ── tool_audit_log ────────────────────────────────────────────────────────
    op.create_table(
        "tool_audit_log",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("run_group", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tool_name", sa.String(100), nullable=False),
        sa.Column("agent_id", sa.String(100), nullable=True),
        sa.Column("arguments_json", postgresql.JSONB(), server_default="{}"),
        sa.Column("exit_code", sa.Integer(), nullable=True),
        sa.Column("output_preview", sa.Text(), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
        sa.Column(
            "executed_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index(
        "idx_tool_audit_workspace", "tool_audit_log", ["workspace_id"]
    )
    op.create_index(
        "idx_tool_audit_run_group", "tool_audit_log", ["run_group"]
    )

    # ── model_usage_log ───────────────────────────────────────────────────────
    op.create_table(
        "model_usage_log",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "workspace_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("run_group", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("model_id", sa.String(255), nullable=False),
        sa.Column("provider", sa.String(100), nullable=False),
        sa.Column("task_type", sa.String(100), nullable=True),
        sa.Column("input_tokens", sa.Integer(), server_default="0"),
        sa.Column("output_tokens", sa.Integer(), server_default="0"),
        sa.Column("cost_usd", sa.Numeric(10, 6), server_default="0"),
        sa.Column(
            "logged_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index(
        "idx_model_usage_workspace", "model_usage_log", ["workspace_id"]
    )
    op.create_index(
        "idx_model_usage_run_group", "model_usage_log", ["run_group"]
    )


def downgrade() -> None:
    op.drop_table("model_usage_log")
    op.drop_table("tool_audit_log")
    op.drop_table("memory_links")
    op.drop_table("memory_tags")
    op.drop_table("memories")
    op.drop_table("quality_scores")
    op.drop_table("builder_runs")
    op.drop_table("task_dependencies")
    op.drop_table("tasks")
    op.drop_table("repo_ownership")
    op.drop_table("repo_commits")
    op.drop_table("repo_branches")
    op.drop_table("project_releases")
    op.drop_table("project_repos")
    op.drop_table("projects")
    op.drop_table("workspace_status")
    op.drop_table("workspace_models")
    op.drop_table("workspace_agents")
    op.drop_table("workspace_secrets")
    op.drop_table("workspace_repos")
    op.drop_table("workspaces")
