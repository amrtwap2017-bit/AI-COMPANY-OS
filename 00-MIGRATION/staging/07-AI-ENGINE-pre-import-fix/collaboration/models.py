"""
app/collaboration/models.py
────────────────────────────────────────────────────────────────
Data shapes for the multi-agent collaboration pipeline.
No database logic. No business logic. Pure data.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class CollabStatus(str, Enum):
    PENDING   = "pending"
    RUNNING   = "running"
    COMPLETE  = "complete"
    FAILED    = "failed"
    PARTIAL   = "partial"   # some agents succeeded, some failed


@dataclass
class AgentTask:
    """One unit of work assigned to one agent."""
    agent_name:   str
    task:         str
    depends_on:   list[str] = field(default_factory=list)
    # agent names this task waits for before running
    context_from: list[str] = field(default_factory=list)
    # agent names whose outputs to inject as context


@dataclass
class AgentOutput:
    """Result produced by one agent."""
    agent_name:       str
    task:             str
    output:           str
    model_used:       str
    success:          bool
    duration_seconds: float
    error:            str | None = None


@dataclass
class CollaborationPlan:
    """Full execution plan for a multi-agent collaboration."""
    goal:         str
    agents:       list[AgentTask]
    # Ordered groups. Agents in the same group run in parallel.
    # Group N waits for group N-1 to complete.
    groups:       list[list[str]] = field(default_factory=list)


@dataclass
class CollaborationResult:
    """Final result of a collaboration run."""
    collab_id:        int
    goal:             str
    status:           CollabStatus
    outputs:          list[AgentOutput]
    final_response:   str
    total_duration:   float
    agents_succeeded: int
    agents_failed:    int
    created_at:       datetime = field(default_factory=datetime.utcnow)

    def get_output(self, agent_name: str) -> AgentOutput | None:
        for o in self.outputs:
            if o.agent_name == agent_name:
                return o
        return None
