"""
Agent Protocol
==============
Defines the structural contract for all agents in the platform.

Every agent in the system (Planner, Architect, Developer, Tester,
Reviewer, Security, Git, Memory, Knowledge, etc.) must implement
this protocol.

Key design decisions:
- Agents never call models directly. They call the ModelRouter.
- Agents never call tools directly. They call the ToolOrchestrator.
- Every agent invocation carries a run_group for full traceability.
- Every agent reads context exclusively via Context Packs.
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Protocol, runtime_checkable
from uuid import UUID


class AgentCapability(str, Enum):
    """
    Registered capabilities that agents can declare.
    The AgentOrchestrator uses these to match agents to tasks.
    """
    PLANNING = "planning"
    ARCHITECTURE = "architecture"
    BACKEND_CODING = "backend_coding"
    FRONTEND_CODING = "frontend_coding"
    DATABASE_DESIGN = "database_design"
    TESTING = "testing"
    SECURITY_SCANNING = "security_scanning"
    CODE_REVIEW = "code_review"
    DOCUMENTATION = "documentation"
    RELEASE_MANAGEMENT = "release_management"
    KNOWLEDGE_INDEXING = "knowledge_indexing"
    MEMORY_DISTILLATION = "memory_distillation"
    RESEARCH = "research"
    DEVOPS = "devops"


class AgentStatus(str, Enum):
    """Current operational status of an agent."""
    IDLE = "idle"
    PLANNING = "planning"
    EXECUTING = "executing"
    WAITING_FOR_TOOL = "waiting_for_tool"
    WAITING_FOR_APPROVAL = "waiting_for_approval"
    COMPLETED = "completed"
    FAILED = "failed"


@runtime_checkable
class AgentProtocol(Protocol):
    """
    Structural contract for all platform agents.

    Every agent must:
    1. Declare its capabilities
    2. Accept a context_pack as its primary input
    3. Return a structured result with artifacts
    4. Never bypass the ToolOrchestrator or ModelRouter
    5. Write to memory on every invocation (success or failure)

    Implementors:
        06-AGENTS/planner.py::PlannerAgent
        06-AGENTS/architect.py::ArchitectAgent
        06-AGENTS/developer.py::DeveloperAgent
        06-AGENTS/tester.py::TesterAgent
        06-AGENTS/reviewer.py::ReviewerAgent
        06-AGENTS/security.py::SecurityAgent
    """

    @property
    def agent_id(self) -> str:
        """Unique identifier for this agent type. e.g. 'planner', 'developer'"""
        ...

    @property
    def capabilities(self) -> list[AgentCapability]:
        """List of capabilities this agent can perform."""
        ...

    @property
    def max_concurrent_tasks(self) -> int:
        """Maximum number of tasks this agent can run simultaneously."""
        ...

    async def execute(
        self,
        task_id: UUID,
        workspace_id: UUID,
        run_group: UUID,
        context_pack: dict[str, Any],
        model_route: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Execute the agent's primary function for a given task.

        Args:
            task_id:      The task being worked on
            workspace_id: Workspace boundary — never cross this
            run_group:    Correlation ID for this execution chain
            context_pack: Assembled context from Context Pack builder
                          Contains: task, workspace_config, relevant_memories,
                          relevant_knowledge, architecture_context, repo_context
            model_route:  From ModelRouter — which model to use
                          Contains: model_id, provider, endpoint, context_window

        Returns:
            {
                "status": "success" | "failure",
                "artifacts": [list of file paths or content blobs produced],
                "reasoning": str,  # agent's explanation of decisions
                "next_agent": str | None,  # suggested next agent in chain
                "memory_entries": [...],  # entries to write to memory
                "duration_ms": int,
                "tokens_used": int,
                "error": str | None,
            }

        Raises:
            AgentExecutionError: on unrecoverable failure
            AgentContextError: if context_pack is malformed
        """
        ...

    async def validate_context_pack(
        self,
        context_pack: dict[str, Any],
    ) -> bool:
        """
        Validate that the context pack contains required fields.
        Returns True if valid, raises AgentContextError if not.
        """
        ...

    async def get_status(self) -> AgentStatus:
        """Return current operational status of this agent."""
        ...
