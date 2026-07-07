"""
Platform Exceptions
===================
All custom exceptions for the AI Company OS platform.

Exception hierarchy design:
- Every subsystem has a base exception
- All subsystem exceptions inherit from PlatformError
- HTTP status codes are declared on exception classes
- Never use raw ValueError or RuntimeError in platform code
- Always use the most specific exception available
"""

from __future__ import annotations


# ─── Base ─────────────────────────────────────────────────────────────────────

class PlatformError(Exception):
    """
    Root exception for all AI Company OS errors.
    Every platform exception must inherit from this.
    """
    http_status_code: int = 500
    error_code: str = "PLATFORM_ERROR"

    def __init__(self, message: str, details: dict | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details or {}

    def to_dict(self) -> dict:
        return {
            "error_code": self.error_code,
            "message": self.message,
            "details": self.details,
        }


# ─── Workspace Exceptions ──────────────────────────────────────────────────────

class WorkspaceError(PlatformError):
    """Base for all workspace-related errors."""
    error_code = "WORKSPACE_ERROR"


class WorkspaceNotFoundError(WorkspaceError):
    http_status_code = 404
    error_code = "WORKSPACE_NOT_FOUND"


class WorkspaceSlugConflictError(WorkspaceError):
    http_status_code = 409
    error_code = "WORKSPACE_SLUG_CONFLICT"


class WorkspaceValidationError(WorkspaceError):
    http_status_code = 422
    error_code = "WORKSPACE_VALIDATION_ERROR"


class WorkspaceNotReadyError(WorkspaceError):
    http_status_code = 409
    error_code = "WORKSPACE_NOT_READY"

    def __init__(self, workspace_id: str, current_state: str) -> None:
        super().__init__(
            f"Workspace {workspace_id} is not ready (state: {current_state}). "
            f"Wait for lifecycle_state=READY before importing repositories."
        )


class WorkspaceStateTransitionError(WorkspaceError):
    http_status_code = 409
    error_code = "WORKSPACE_STATE_TRANSITION_ERROR"


class WorkspaceSecretNotFoundError(WorkspaceError):
    http_status_code = 404
    error_code = "WORKSPACE_SECRET_NOT_FOUND"


class WorkspaceBoundaryViolationError(WorkspaceError):
    """Raised when a path escapes the workspace directory boundary."""
    http_status_code = 403
    error_code = "WORKSPACE_BOUNDARY_VIOLATION"

    def __init__(self, attempted_path: str, workspace_slug: str) -> None:
        super().__init__(
            f"Path '{attempted_path}' escapes workspace boundary for '{workspace_slug}'. "
            f"Directory traversal is not permitted."
        )


# ─── Repository Exceptions ─────────────────────────────────────────────────────

class RepositoryError(PlatformError):
    """Base for all repository-related errors."""
    error_code = "REPOSITORY_ERROR"


class RepositoryNotFoundError(RepositoryError):
    http_status_code = 404
    error_code = "REPOSITORY_NOT_FOUND"


class RepositoryCloneError(RepositoryError):
    http_status_code = 500
    error_code = "REPOSITORY_CLONE_ERROR"


class RepositoryCommitError(RepositoryError):
    http_status_code = 500
    error_code = "REPOSITORY_COMMIT_ERROR"


# ─── Project Exceptions ────────────────────────────────────────────────────────

class ProjectError(PlatformError):
    error_code = "PROJECT_ERROR"


class ProjectNotFoundError(ProjectError):
    http_status_code = 404
    error_code = "PROJECT_NOT_FOUND"


class ProjectSlugConflictError(ProjectError):
    http_status_code = 409
    error_code = "PROJECT_SLUG_CONFLICT"


# ─── Task Exceptions ───────────────────────────────────────────────────────────

class TaskError(PlatformError):
    error_code = "TASK_ERROR"


class TaskNotFoundError(TaskError):
    http_status_code = 404
    error_code = "TASK_NOT_FOUND"


class TaskStateTransitionError(TaskError):
    http_status_code = 409
    error_code = "TASK_STATE_TRANSITION_ERROR"


class TaskMaxRetriesExceededError(TaskError):
    http_status_code = 409
    error_code = "TASK_MAX_RETRIES_EXCEEDED"


class TaskDependencyError(TaskError):
    http_status_code = 409
    error_code = "TASK_DEPENDENCY_NOT_MET"


# ─── Agent Exceptions ──────────────────────────────────────────────────────────

class AgentError(PlatformError):
    error_code = "AGENT_ERROR"


class AgentNotFoundError(AgentError):
    http_status_code = 404
    error_code = "AGENT_NOT_FOUND"


class AgentExecutionError(AgentError):
    http_status_code = 500
    error_code = "AGENT_EXECUTION_ERROR"


class AgentContextError(AgentError):
    http_status_code = 422
    error_code = "AGENT_CONTEXT_ERROR"


class AgentCapabilityError(AgentError):
    http_status_code = 403
    error_code = "AGENT_CAPABILITY_ERROR"


# ─── Tool Exceptions ───────────────────────────────────────────────────────────

class ToolError(PlatformError):
    error_code = "TOOL_ERROR"


class ToolNotFoundError(ToolError):
    http_status_code = 404
    error_code = "TOOL_NOT_FOUND"


class ToolExecutionError(ToolError):
    http_status_code = 500
    error_code = "TOOL_EXECUTION_ERROR"


class ToolScopeError(ToolError):
    http_status_code = 403
    error_code = "TOOL_SCOPE_ERROR"

    def __init__(self, tool_name: str, required_scope: str, agent_id: str) -> None:
        super().__init__(
            f"Agent '{agent_id}' lacks scope '{required_scope}' required by tool '{tool_name}'."
        )


class ToolRateLimitError(ToolError):
    http_status_code = 429
    error_code = "TOOL_RATE_LIMIT_EXCEEDED"


class ToolValidationError(ToolError):
    http_status_code = 422
    error_code = "TOOL_VALIDATION_ERROR"


class ToolBoundaryViolationError(ToolError):
    http_status_code = 403
    error_code = "TOOL_BOUNDARY_VIOLATION"


# ─── Model Router Exceptions ───────────────────────────────────────────────────

class ModelRouterError(PlatformError):
    error_code = "MODEL_ROUTER_ERROR"


class ModelRouteNotFoundError(ModelRouterError):
    http_status_code = 404
    error_code = "MODEL_ROUTE_NOT_FOUND"


class ModelUnavailableError(ModelRouterError):
    http_status_code = 503
    error_code = "MODEL_UNAVAILABLE"


# ─── Quality Exceptions ────────────────────────────────────────────────────────

class QualityError(PlatformError):
    error_code = "QUALITY_ERROR"


class QualityGateBlockedError(QualityError):
    """Raised when quality gate prevents merge."""
    http_status_code = 422
    error_code = "QUALITY_GATE_BLOCKED"

    def __init__(self, overall_score: float, threshold: float, run_group: str) -> None:
        super().__init__(
            f"Quality gate blocked merge for run_group={run_group}. "
            f"Score {overall_score:.1f} is below threshold {threshold:.1f}."
        )


# ─── Memory Exceptions ─────────────────────────────────────────────────────────

class MemoryError(PlatformError):
    error_code = "MEMORY_ERROR"


class MemoryNotFoundError(MemoryError):
    http_status_code = 404
    error_code = "MEMORY_NOT_FOUND"


# ─── Knowledge Exceptions ──────────────────────────────────────────────────────

class KnowledgeError(PlatformError):
    error_code = "KNOWLEDGE_ERROR"


class KnowledgeIngestionError(KnowledgeError):
    http_status_code = 500
    error_code = "KNOWLEDGE_INGESTION_ERROR"


# ─── Execution Exceptions ──────────────────────────────────────────────────────

class ExecutionError(PlatformError):
    error_code = "EXECUTION_ERROR"


class ExecutionPipelineError(ExecutionError):
    http_status_code = 500
    error_code = "EXECUTION_PIPELINE_ERROR"


class ExecutionContextError(ExecutionError):
    http_status_code = 422
    error_code = "EXECUTION_CONTEXT_ERROR"
