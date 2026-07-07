"""
Shared Domain Schemas
=====================
Pydantic models shared across all platform subsystems.

Rules:
- These are DATA shapes only — no business logic
- Used for API request/response validation
- Used for inter-service message passing
- Used for event payload validation
- Import ONLY from standard library and pydantic
- Never import from other platform packages
"""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, field_validator


# ─── Base Models ──────────────────────────────────────────────────────────────

class TimestampedModel(BaseModel):
    """Base for all domain models with audit timestamps."""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"from_attributes": True}


class PaginationParams(BaseModel):
    """Standard pagination parameters for list endpoints."""
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseModel):
    """Standard paginated response envelope."""
    items: list[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


# ─── Workspace Schemas ─────────────────────────────────────────────────────────

class WorkspaceCreate(BaseModel):
    """Request body for POST /api/v1/workspaces"""
    name: str = Field(min_length=2, max_length=255)
    slug: str = Field(min_length=2, max_length=100, pattern=r"^[a-z0-9-]+$")
    description: str = Field(default="", max_length=1000)

    @field_validator("slug")
    @classmethod
    def slug_must_be_lowercase(cls, v: str) -> str:
        return v.lower().strip()


class WorkspaceResponse(TimestampedModel):
    """Response shape for workspace operations."""
    id: UUID
    name: str
    slug: str
    description: str
    lifecycle_state: str


class WorkspaceStatusResponse(BaseModel):
    """Response for GET /api/v1/workspaces/{wid}/status"""
    workspace_id: UUID
    lifecycle_state: str
    components: list[dict[str, Any]]
    repo_count: int
    memory_count: int
    vector_count: int


class RepoImportRequest(BaseModel):
    """Request body for POST /api/v1/workspaces/{wid}/repos"""
    git_url: str = Field(min_length=5, max_length=1024)
    branch_target: str = Field(default="main", max_length=100)

    @field_validator("git_url")
    @classmethod
    def validate_git_url(cls, v: str) -> str:
        v = v.strip()
        if not (v.startswith("https://") or v.startswith("git@")):
            raise ValueError("git_url must start with https:// or git@")
        return v


# ─── Project Schemas ───────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    """Request body for POST /api/v1/workspaces/{wid}/projects"""
    name: str = Field(min_length=2, max_length=255)
    slug: str = Field(min_length=2, max_length=100, pattern=r"^[a-z0-9-]+$")
    roadmap_goals: str = Field(default="", max_length=10000)


class ProjectResponse(TimestampedModel):
    """Response shape for project operations."""
    id: UUID
    workspace_id: UUID
    name: str
    slug: str
    roadmap_goals: str


# ─── Task Schemas ──────────────────────────────────────────────────────────────

class AcceptanceCriteria(BaseModel):
    """
    Machine-readable acceptance criteria for a task.
    The Quality Engine and Tester Agent use this to validate completion.
    """
    must_pass_tests: list[str] = Field(
        default_factory=list,
        description="pytest paths that must pass. e.g. ['tests/test_auth.py']"
    )
    must_have_coverage: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        description="Minimum test coverage percentage required"
    )
    must_have_endpoints: list[str] = Field(
        default_factory=list,
        description="REST endpoints that must exist. e.g. ['POST /api/v1/users']"
    )
    must_not_have_security_issues: bool = Field(
        default=True,
        description="Bandit scan must return zero high-severity findings"
    )
    architecture_score_minimum: float = Field(
        default=70.0,
        ge=0.0,
        le=100.0,
        description="Minimum architecture quality score from Reviewer Agent"
    )
    custom_checks: list[str] = Field(
        default_factory=list,
        description="Shell commands that must exit 0"
    )


class TaskCreate(BaseModel):
    """Request body for POST /api/v1/tasks"""
    workspace_id: UUID
    project_id: UUID
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(default="", max_length=10000)
    task_type: str = Field(
        default="story",
        pattern=r"^(epic|feature|story|task|subtask|bug|spike)$"
    )
    acceptance_criteria: AcceptanceCriteria = Field(
        default_factory=AcceptanceCriteria
    )
    assigned_agent: str | None = None
    model_hint: str | None = None
    max_retries: int = Field(default=5, ge=1, le=10)
    parent_id: UUID | None = None
    depends_on: list[UUID] = Field(default_factory=list)


class TaskResponse(TimestampedModel):
    """Response shape for task operations."""
    id: UUID
    workspace_id: UUID
    project_id: UUID
    title: str
    description: str
    task_type: str
    acceptance_criteria: AcceptanceCriteria
    assigned_agent: str | None
    model_hint: str | None
    status: str
    retry_count: int
    max_retries: int
    run_group: UUID | None
    parent_id: UUID | None


class TaskExecuteResponse(BaseModel):
    """Response for POST /api/v1/tasks/{id}/execute"""
    task_id: UUID
    run_group: UUID
    status: str
    message: str


# ─── Execution Schemas ─────────────────────────────────────────────────────────

class BuilderRunResponse(TimestampedModel):
    """Response shape for execution run records."""
    id: UUID
    workspace_id: UUID
    project_id: UUID
    task_id: UUID
    run_group: UUID
    stage: str
    attempt: int
    is_ok: bool
    duration_ms: int
    output_preview: str | None
    error_message: str | None


class QualityScoreResponse(BaseModel):
    """Response shape for quality gate results."""
    run_group: UUID
    architecture_score: float
    security_score: float
    performance_score: float
    test_coverage_score: float
    code_smells_score: float
    doc_completeness_score: float
    hallucination_index: float
    overall_score: float
    passed_gate: bool
    feedback_details: dict[str, Any]
    created_at: datetime


# ─── Model Router Schemas ──────────────────────────────────────────────────────

class ModelRouteRequest(BaseModel):
    """Request body for POST /api/v1/models/route"""
    task_type: str
    workspace_id: UUID
    complexity: str = Field(
        default="medium",
        pattern=r"^(low|medium|high)$"
    )
    local_only: bool = False
    context_size_estimate: int = Field(default=0, ge=0)


class ModelRouteResponse(BaseModel):
    """Response for POST /api/v1/models/route"""
    model_id: str
    provider: str
    endpoint: str
    context_window: int
    estimated_cost_per_1k_tokens: float
    is_local: bool
    fallback_model_id: str | None


# ─── Event Schemas ─────────────────────────────────────────────────────────────

class PlatformEvent(BaseModel):
    """Base schema for all platform events published to the event bus."""
    event_id: UUID = Field(default_factory=uuid4)
    event_name: str
    workspace_id: UUID
    run_group: UUID | None = None
    payload: dict[str, Any] = Field(default_factory=dict)
    published_at: datetime = Field(default_factory=datetime.utcnow)
    schema_version: str = "1.0"


class WorkspaceStateChangedEvent(PlatformEvent):
    """Emitted when workspace lifecycle state changes."""
    event_name: str = "workspace.lifecycle.state_changed"


class TaskAssignedEvent(PlatformEvent):
    """Emitted when a task is assigned to an agent."""
    event_name: str = "task.lifecycle.assigned"


class AgentCompletedEvent(PlatformEvent):
    """Emitted when an agent completes a task."""
    event_name: str = "agent.execution.completed"


class QualityGateFailedEvent(PlatformEvent):
    """Emitted when quality gate blocks a merge."""
    event_name: str = "quality.gate.failed"


class PipelineCompletedEvent(PlatformEvent):
    """Emitted when full autonomous pipeline completes."""
    event_name: str = "pipeline.run.completed"
