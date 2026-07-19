"""
app/tools/collab_router.py
────────────────────────────────────────────────────────────────
Agent Collaboration Router — Smart task decomposition.

Analyzes a complex task and automatically:
  1. Breaks it into optimal sub-tasks
  2. Assigns each to the best agent
  3. Identifies parallelizable vs sequential steps
  4. Estimates effort and priority

This prevents single agents from being overloaded
and ensures the right specialist handles each piece.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field

from tools.base import BaseTool, ToolResult

log = logging.getLogger(__name__)


@dataclass
class SubTask:
    id:         str
    task:       str
    agent:      str
    priority:   int
    parallel:   bool
    depends_on: list[str]
    reason:     str


@dataclass
class TaskPlan:
    original_task: str
    complexity:    str
    sub_tasks:     list[SubTask]
    parallel_groups: list[list[str]]
    estimated_agents: int
    summary:       str


# Agent capability map
AGENT_CAPABILITIES = {
    "researcher":    ["research", "investigate", "find", "search", "analyze information",
                      "background", "context", "history", "overview"],
    "analyst":       ["data", "statistics", "metrics", "analyze", "trends", "numbers",
                      "calculate", "measure", "performance"],
    "planner":       ["plan", "roadmap", "schedule", "organize", "prioritize",
                      "milestones", "sprint", "breakdown", "structure"],
    "architect":     ["design", "architecture", "system", "schema", "database",
                      "infrastructure", "components", "diagram"],
    "backend":       ["api", "endpoint", "server", "database", "python", "fastapi",
                      "implement", "backend", "service", "logic"],
    "frontend":      ["ui", "react", "component", "page", "css", "html",
                      "interface", "frontend", "user", "design"],
    "developer":     ["build", "fullstack", "feature", "integrate", "both",
                      "end-to-end", "complete"],
    "tester":        ["test", "testing", "quality", "validate", "verify",
                      "coverage", "pytest", "qa"],
    "reviewer":      ["review", "audit", "check", "security", "code review",
                      "inspect", "evaluate"],
    "devops":        ["deploy", "docker", "kubernetes", "ci/cd", "infrastructure",
                      "pipeline", "hosting", "server"],
    "writer":        ["write", "document", "readme", "guide", "tutorial",
                      "content", "report", "summary"],
    "evaluator":     ["evaluate", "score", "assess", "quality check", "grade"],
    "knowledge_manager": ["knowledge", "documentation", "index", "organize docs"],
}


class CollaborationRouterTool(BaseTool):
    name        = "collab_router"
    description = (
        "Decomposes complex tasks into optimal sub-tasks and assigns each "
        "to the best agent. Identifies what can run in parallel vs sequential. "
        "Use for complex multi-step projects to get the most efficient plan."
    )
    permissions_required = []

    def run(
        self,
        task:       str,
        max_agents: int  = 5,
        detailed:   bool = True,
    ) -> ToolResult:
        """
        Route a complex task to optimal agents.

        Args:
            task:       The task to decompose
            max_agents: Maximum agents to use
            detailed:   Include detailed reasoning

        Returns:
            ToolResult with TaskPlan
        """
        try:
            plan = self._route(task, max_agents)

            return ToolResult(
                tool=self.name,
                success=True,
                output={
                    "original_task":   plan.original_task,
                    "complexity":      plan.complexity,
                    "estimated_agents": plan.estimated_agents,
                    "summary":         plan.summary,
                    "parallel_groups": plan.parallel_groups,
                    "sub_tasks": [
                        {
                            "id":         t.id,
                            "task":       t.task,
                            "agent":      t.agent,
                            "priority":   t.priority,
                            "parallel":   t.parallel,
                            "depends_on": t.depends_on,
                            "reason":     t.reason if detailed else "",
                        }
                        for t in plan.sub_tasks
                    ],
                    "recommended_strategy": self._recommend_strategy(plan),
                },
            )

        except Exception as exc:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=str(exc),
            )

    def _route(self, task: str, max_agents: int) -> TaskPlan:
        """Decompose and route the task."""
        complexity = self._assess_complexity(task)
        sub_tasks  = self._decompose(task, max_agents)
        groups     = self._find_parallel_groups(sub_tasks)

        summary = (
            f"Task decomposed into {len(sub_tasks)} sub-tasks "
            f"for {len({t.agent for t in sub_tasks})} unique agent(s). "
            f"Complexity: {complexity}. "
            f"{len(groups)} execution group(s) identified."
        )

        return TaskPlan(
            original_task=task,
            complexity=complexity,
            sub_tasks=sub_tasks,
            parallel_groups=groups,
            estimated_agents=len({t.agent for t in sub_tasks}),
            summary=summary,
        )

    def _assess_complexity(self, task: str) -> str:
        words = len(task.split())
        if words < 20:   return "simple"
        if words < 50:   return "moderate"
        return "complex"

    def _decompose(self, task: str, max_agents: int) -> list[SubTask]:
        task_lower = task.lower()
        sub_tasks  = []

        # Detect what phases are needed
        phases = {
            "research":     self._needs_research(task_lower),
            "planning":     self._needs_planning(task_lower),
            "architecture": self._needs_architecture(task_lower),
            "backend":      self._needs_backend(task_lower),
            "frontend":     self._needs_frontend(task_lower),
            "testing":      self._needs_testing(task_lower),
            "docs":         self._needs_docs(task_lower),
            "deploy":       self._needs_deploy(task_lower),
        }

        priority = 1
        prev_ids: list[str] = []

        if phases["research"]:
            tid = "T1_research"
            sub_tasks.append(SubTask(
                id=tid,
                task=f"Research requirements and context: {task[:100]}",
                agent="researcher",
                priority=priority,
                parallel=False,
                depends_on=[],
                reason="Gather context before building",
            ))
            priority += 1
            prev_ids = [tid]

        if phases["planning"]:
            tid = "T2_plan"
            sub_tasks.append(SubTask(
                id=tid,
                task=f"Create implementation plan: {task[:100]}",
                agent="planner",
                priority=priority,
                parallel=bool(phases["research"]),
                depends_on=[],
                reason="Planning can run parallel with research",
            ))
            if not phases["research"]:
                prev_ids = [tid]

        if phases["architecture"]:
            tid = "T3_arch"
            sub_tasks.append(SubTask(
                id=tid,
                task=f"Design system architecture for: {task[:100]}",
                agent="architect",
                priority=priority + 1,
                parallel=False,
                depends_on=prev_ids.copy(),
                reason="Architecture must come after research and planning",
            ))
            prev_ids = [tid]
            priority += 1

        if phases["backend"]:
            tid = "T4_backend"
            sub_tasks.append(SubTask(
                id=tid,
                task=f"Implement backend: {task[:100]}",
                agent="backend",
                priority=priority + 1,
                parallel=False,
                depends_on=prev_ids.copy(),
                reason="Backend implementation after architecture",
            ))
            backend_id = tid

        if phases["frontend"]:
            tid = "T5_frontend"
            sub_tasks.append(SubTask(
                id=tid,
                task=f"Build frontend UI: {task[:100]}",
                agent="frontend",
                priority=priority + 1,
                parallel=phases["backend"],
                depends_on=prev_ids.copy() if not phases["backend"] else prev_ids[:-1],
                reason="Frontend can be built parallel with backend if independent",
            ))

        if phases["testing"]:
            backend_frontend_ids = [
                t.id for t in sub_tasks
                if t.agent in ("backend", "frontend", "developer")
            ]
            sub_tasks.append(SubTask(
                id="T6_test",
                task=f"Write and run tests: {task[:100]}",
                agent="tester",
                priority=priority + 2,
                parallel=False,
                depends_on=backend_frontend_ids,
                reason="Testing after implementation",
            ))

        if phases["docs"]:
            sub_tasks.append(SubTask(
                id="T7_docs",
                task=f"Write documentation: {task[:100]}",
                agent="writer",
                priority=priority + 2,
                parallel=True,
                depends_on=[t.id for t in sub_tasks if t.agent == "backend"],
                reason="Documentation can start while testing runs",
            ))

        if phases["deploy"] and len(sub_tasks) < max_agents:
            sub_tasks.append(SubTask(
                id="T8_deploy",
                task=f"Create deployment configuration: {task[:100]}",
                agent="devops",
                priority=priority + 3,
                parallel=False,
                depends_on=[t.id for t in sub_tasks if t.agent in ("backend","tester")],
                reason="Deploy after testing passes",
            ))

        return sub_tasks[:max_agents]

    def _find_parallel_groups(self, tasks: list[SubTask]) -> list[list[str]]:
        """Group tasks that can run in parallel."""
        groups: list[list[str]] = []
        remaining = [t for t in tasks]

        while remaining:
            group_ids = []
            completed = {t.id for g in groups for t in tasks if t.id in g}

            for task in remaining:
                if all(dep in completed for dep in task.depends_on):
                    group_ids.append(task.id)

            if not group_ids:
                group_ids = [remaining[0].id]

            groups.append(group_ids)
            remaining = [t for t in remaining if t.id not in group_ids]

        return groups

    def _recommend_strategy(self, plan: TaskPlan) -> str:
        agents = {t.agent for t in plan.sub_tasks}
        if len(plan.parallel_groups) <= 2:
            return "sequential"
        elif len(agents) >= 3:
            return "full_pipeline"
        elif "backend" in agents and "frontend" in agents:
            return "parallel_development"
        return "sequential"

    def _needs_research(self, task): return any(w in task for w in ["research","find","investigate","background"])
    def _needs_planning(self, task): return any(w in task for w in ["plan","roadmap","organize","structure","break"])
    def _needs_architecture(self, task): return any(w in task for w in ["architect","design","system","schema","database"])
    def _needs_backend(self, task): return any(w in task for w in ["api","backend","server","endpoint","python","fastapi"])
    def _needs_frontend(self, task): return any(w in task for w in ["frontend","ui","react","interface","page","component"])
    def _needs_testing(self, task): return any(w in task for w in ["test","quality","validate","verify","qa","coverage"])
    def _needs_docs(self, task): return any(w in task for w in ["document","readme","guide","docs","write"])
    def _needs_deploy(self, task): return any(w in task for w in ["deploy","docker","production","host","release"])


collab_router_tool = CollaborationRouterTool()
