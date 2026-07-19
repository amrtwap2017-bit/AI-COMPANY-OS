"""
Workflow Data Models
─────────────────────────────────────────────────────
Pure Python dataclasses — no SQLAlchemy.
These represent the in-memory state of a workflow
as it executes.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class TaskStatus(str, Enum):
    PENDING   = "pending"
    RUNNING   = "running"
    SUCCESS   = "success"
    FAILED    = "failed"
    SKIPPED   = "skipped"


class WorkflowStatus(str, Enum):
    PENDING  = "pending"
    RUNNING  = "running"
    SUCCESS  = "success"
    FAILED   = "failed"
    PARTIAL  = "partial"


@dataclass
class Task:
    id: str
    name: str
    agent: str
    instruction: str
    depends_on: list[str] = field(default_factory=list)
    tools: list[str] = field(default_factory=list)
    status: TaskStatus = TaskStatus.PENDING
    result: Any = None
    error: str | None = None
    duration_seconds: float = 0.0

    def is_ready(self, completed_task_ids: set[str]) -> bool:
        """
        A task is ready when all its dependencies are completed.
        """
        return all(dep in completed_task_ids for dep in self.depends_on)


@dataclass
class WorkflowDefinition:
    name: str
    goal: str
    tasks: list[Task]
    description: str = ""

    def get_task(self, task_id: str) -> Task | None:
        return next((t for t in self.tasks if t.id == task_id), None)

    def get_ready_tasks(self, completed: set[str]) -> list[Task]:
        return [
            t for t in self.tasks
            if t.status == TaskStatus.PENDING
            and t.is_ready(completed)
        ]


@dataclass
class WorkflowResult:
    workflow_id: int
    name: str
    goal: str
    status: WorkflowStatus
    task_count: int
    completed_count: int
    failed_count: int
    duration_seconds: float
    task_results: dict[str, Any]
    summary: str
    success: bool
    error: str | None = None
