"""
Agent Orchestrator
==================
Registry and dispatcher for all platform agents.

Responsibilities:
- Maintains the agent registry (capabilities, models, concurrency limits)
- Dispatches tasks to appropriate agents based on task_type and assigned_agent
- Handles retry logic and escalation
- Emits agent.execution events for observability

Wave 2 scope:
  - Planner Agent: fully functional (decomposes epics)
  - All other agents: registered but stub execution
  - Wave 3: full execution for Developer, Tester, Reviewer, Security

Agent Registry:
  planner      → PlannerAgent    (planning, task_decomposition)
  architect    → ArchitectAgent  (architecture, design)
  developer    → DeveloperAgent  (backend_coding, frontend_coding)
  tester       → TesterAgent     (testing, qa)
  reviewer     → ReviewerAgent   (code_review, architecture_review)
  security     → SecurityAgent   (security_scanning, vulnerability_detection)
  git          → GitAgent        (git operations, releases)
  memory       → MemoryAgent     (memory_distillation)
  knowledge    → KnowledgeAgent  (knowledge_indexing)
  documentation → DocumentationAgent (documentation)
"""

from __future__ import annotations

import os
from typing import Any
from uuid import UUID, uuid4

from .planner import PlannerAgent


# ─── Agent Registry Definition ────────────────────────────────────────────────

AGENT_REGISTRY: dict[str, dict[str, Any]] = {
    "planner": {
        "capabilities": ["planning", "task_decomposition", "dependency_analysis"],
        "preferred_models": {
            "planning": "qwen2.5-coder:7b",
            "architecture": "qwen2.5-coder:14b",
        },
        "required_scopes": ["database:read", "database:write"],
        "max_concurrent_tasks": 3,
        "wave": 2,
        "status": "active",
    },
    "architect": {
        "capabilities": ["architecture", "design", "interface_design"],
        "preferred_models": {
            "architecture": "claude-3-5-sonnet-20241022",
            "fast_review": "claude-3-5-haiku-20241022",
        },
        "required_scopes": ["filesystem:read", "database:read"],
        "max_concurrent_tasks": 2,
        "wave": 3,
        "status": "stub",
    },
    "developer": {
        "capabilities": ["backend_coding", "frontend_coding", "database_design"],
        "preferred_models": {
            "coding": "gpt-4o",
            "coding_local": "qwen2.5-coder:7b",
        },
        "required_scopes": [
            "filesystem:read", "filesystem:write",
            "git:read", "git:write", "shell:execute",
        ],
        "max_concurrent_tasks": 5,
        "wave": 3,
        "status": "stub",
    },
    "tester": {
        "capabilities": ["testing", "qa", "test_generation"],
        "preferred_models": {"testing": "gpt-4o"},
        "required_scopes": [
            "filesystem:read", "filesystem:write",
            "shell:execute", "test:execute",
        ],
        "max_concurrent_tasks": 3,
        "wave": 3,
        "status": "stub",
    },
    "reviewer": {
        "capabilities": ["code_review", "architecture_review", "quality_scoring"],
        "preferred_models": {
            "fast_review": "claude-3-5-haiku-20241022",
            "architecture": "claude-3-5-sonnet-20241022",
        },
        "required_scopes": ["filesystem:read", "database:write"],
        "max_concurrent_tasks": 3,
        "wave": 3,
        "status": "stub",
    },
    "security": {
        "capabilities": ["security_scanning", "vulnerability_detection", "secret_detection"],
        "preferred_models": {"security_scan": "claude-3-5-haiku-20241022"},
        "required_scopes": ["filesystem:read", "shell:execute"],
        "max_concurrent_tasks": 2,
        "wave": 3,
        "status": "stub",
    },
    "git": {
        "capabilities": ["git_operations", "release_management", "changelog_generation"],
        "preferred_models": {"fast_review": "gpt-4o-mini"},
        "required_scopes": ["git:read", "git:write", "filesystem:read"],
        "max_concurrent_tasks": 2,
        "wave": 3,
        "status": "stub",
    },
    "memory": {
        "capabilities": ["memory_distillation", "pattern_extraction"],
        "preferred_models": {"fast_review": "gpt-4o-mini"},
        "required_scopes": ["database:read", "database:write"],
        "max_concurrent_tasks": 5,
        "wave": 2,
        "status": "active",
    },
    "knowledge": {
        "capabilities": ["knowledge_indexing", "document_parsing", "graph_building"],
        "preferred_models": {"embedding": "nomic-embed-text"},
        "required_scopes": [
            "filesystem:read", "database:write", "network:read",
        ],
        "max_concurrent_tasks": 3,
        "wave": 2,
        "status": "active",
    },
    "documentation": {
        "capabilities": ["documentation", "readme_generation", "api_docs"],
        "preferred_models": {"documentation": "gpt-4o-mini"},
        "required_scopes": ["filesystem:read", "filesystem:write"],
        "max_concurrent_tasks": 3,
        "wave": 3,
        "status": "stub",
    },
}


class AgentOrchestrator:
    """
    Coordinates all agent dispatching.

    Wave 2 active agents: planner, memory, knowledge
    Wave 3 agents: architect, developer, tester, reviewer, security, git
    """

    def __init__(self, workspace_id: UUID, workspace_slug: str) -> None:
        self.workspace_id = workspace_id
        self.workspace_slug = workspace_slug
        self._planner = PlannerAgent()

    async def dispatch_task(
        self,
        task_id: UUID,
        project_id: UUID,
        task_title: str,
        task_description: str,
        task_type: str,
        assigned_agent: str | None,
        acceptance_criteria: dict,
        context_memories: dict | None = None,
    ) -> dict[str, Any]:
        """
        Route a task to the appropriate agent.

        For epics and features: always goes to planner first.
        For other types: routes to assigned_agent if specified,
                         otherwise uses task_type to determine agent.
        """
        # Determine which agent should handle this
        agent_role = self._determine_agent(task_type, assigned_agent)
        registry_entry = AGENT_REGISTRY.get(agent_role, {})

        if registry_entry.get("status") == "stub":
            return {
                "task_id": str(task_id),
                "agent_role": agent_role,
                "status": "queued",
                "message": f"Agent '{agent_role}' is queued for Wave 3 implementation.",
                "run_group": str(uuid4()),
            }

        # Planner handles epics and features
        if task_type in ("epic", "feature") or agent_role == "planner":
            result = await self._planner.decompose_epic(
                task_id=task_id,
                workspace_id=self.workspace_id,
                project_id=project_id,
                title=task_title,
                description=task_description,
                acceptance_criteria=acceptance_criteria,
                context_memories=context_memories,
            )
            return {
                "task_id": str(task_id),
                "agent_role": "planner",
                "status": "planned",
                "subtasks_created": result.get("subtasks_created", 0),
                "run_group": result.get("run_group"),
                "plan": result.get("plan"),
            }

        return {
            "task_id": str(task_id),
            "agent_role": agent_role,
            "status": "queued",
            "message": f"Task dispatched to {agent_role} agent.",
            "run_group": str(uuid4()),
        }

    def _determine_agent(self, task_type: str, assigned_agent: str | None) -> str:
        """Determine which agent should handle a task."""
        if assigned_agent and assigned_agent in AGENT_REGISTRY:
            return assigned_agent

        type_to_agent = {
            "epic": "planner",
            "feature": "planner",
            "story": "developer",
            "task": "developer",
            "subtask": "developer",
            "bug": "developer",
            "spike": "architect",
        }
        return type_to_agent.get(task_type, "developer")

    def get_registry(self) -> dict[str, Any]:
        """Return the full agent registry for the dashboard."""
        return {
            agent_id: {
                "capabilities": info["capabilities"],
                "status": info["status"],
                "wave": info["wave"],
                "max_concurrent_tasks": info["max_concurrent_tasks"],
            }
            for agent_id, info in AGENT_REGISTRY.items()
        }

    def get_workspace_agents(self) -> list[dict[str, Any]]:
        """Return agents active for this workspace."""
        active = []
        for agent_id, info in AGENT_REGISTRY.items():
            active.append({
                "agent_id": agent_id,
                "capabilities": info["capabilities"],
                "status": info["status"],
                "preferred_models": info.get("preferred_models", {}),
            })
        return active
