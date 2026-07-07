"""
Model Router Protocol
=====================
Defines the structural contract for the Model Router subsystem.

The Model Router is the ONLY component that knows which AI model
to use for a given task. Agents never select models themselves.

This enforces the core architectural principle:
  Models are interchangeable execution engines.
  The OS decides which model, when, with what context.

Routing precedence:
  1. Workspace-level override (workspace_models table)
  2. Task-type + complexity matrix (default routing table)
  3. Local-only flag (forces Ollama)
  4. Fallback model (if primary is unavailable)
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Protocol, runtime_checkable
from uuid import UUID


class TaskType(str, Enum):
    """
    Task types used for model routing decisions.
    Each type maps to a different model selection strategy.
    """
    ARCHITECTURE = "architecture"
    CODING = "coding"
    RESEARCH = "research"
    REASONING = "reasoning"
    FAST_REVIEW = "fast_review"
    EMBEDDING = "embedding"
    PLANNING = "planning"
    SECURITY_SCAN = "security_scan"
    DOCUMENTATION = "documentation"
    TESTING = "testing"


class ModelProvider(str, Enum):
    """Registered model providers."""
    OLLAMA = "ollama"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"


class ModelRoute:
    """
    The output of a routing decision.
    Carries everything an agent needs to call the model.
    """

    def __init__(
        self,
        model_id: str,
        provider: ModelProvider,
        endpoint: str,
        context_window: int,
        estimated_cost_per_1k_tokens: float,
        is_local: bool,
        fallback_model_id: str | None = None,
    ) -> None:
        self.model_id = model_id
        self.provider = provider
        self.endpoint = endpoint
        self.context_window = context_window
        self.estimated_cost_per_1k_tokens = estimated_cost_per_1k_tokens
        self.is_local = is_local
        self.fallback_model_id = fallback_model_id

    def to_dict(self) -> dict[str, Any]:
        return {
            "model_id": self.model_id,
            "provider": self.provider.value,
            "endpoint": self.endpoint,
            "context_window": self.context_window,
            "estimated_cost_per_1k_tokens": self.estimated_cost_per_1k_tokens,
            "is_local": self.is_local,
            "fallback_model_id": self.fallback_model_id,
        }


@runtime_checkable
class ModelRouterProtocol(Protocol):
    """
    Structural contract for the Model Router.

    Implementors:
        10-ENGINEERING-HUB/api/models.py::ModelRouter

    Consumers:
        06-AGENTS/*.py (all agents request routes before calling models)
        09-EXECUTION/execution_engine.py (pipeline uses router)
    """

    async def determine_route(
        self,
        task_type: TaskType,
        workspace_id: UUID,
        complexity: str,
        local_only: bool = False,
        context_size_estimate: int = 0,
    ) -> ModelRoute:
        """
        Determine the optimal model for a task.

        Args:
            task_type:             Type of work being done
            workspace_id:          Check for workspace-level overrides
            complexity:            "low" | "medium" | "high"
            local_only:            Force Ollama models (air-gapped mode)
            context_size_estimate: Estimated tokens needed (for window check)

        Returns:
            ModelRoute with all connection details

        Raises:
            ModelRouteNotFoundError: if no model available for task_type
            ModelUnavailableError: if selected model is not responding
        """
        ...

    async def record_token_usage(
        self,
        run_group: UUID,
        workspace_id: UUID,
        model_id: str,
        provider: ModelProvider,
        input_tokens: int,
        output_tokens: int,
        cost_usd: float,
    ) -> bool:
        """
        Record token usage for cost tracking and observability.
        Every model call must call this after completion.

        Returns:
            True if recorded successfully
        """
        ...

    async def get_workspace_model_overrides(
        self,
        workspace_id: UUID,
    ) -> dict[str, Any]:
        """
        Return custom model routing rules for a workspace.
        Empty dict means use platform defaults.
        """
        ...

    async def set_workspace_model_override(
        self,
        workspace_id: UUID,
        task_type: TaskType,
        model_id: str,
        provider: ModelProvider,
    ) -> bool:
        """
        Set a workspace-specific model override for a task type.
        Stored in workspace_models table.
        """
        ...

    async def health_check_model(
        self,
        model_id: str,
        provider: ModelProvider,
    ) -> bool:
        """
        Check if a specific model is currently available.
        Used before routing to ensure fallback if needed.
        """
        ...
