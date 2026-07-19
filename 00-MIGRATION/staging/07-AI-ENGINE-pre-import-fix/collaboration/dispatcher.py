"""
app/collaboration/dispatcher.py
────────────────────────────────────────────────────────────────
Analyzes a goal and decides which agents to use,
what order to run them, and which outputs to share.

Rule-based dispatcher — no LLM call.
Fast, deterministic, predictable.

Dispatch strategies:
  research_and_write  → researcher → writer → evaluator
  plan_and_build      → planner → architect → backend
  analyze_and_report  → analyst → researcher → writer
  review_and_improve  → backend → reviewer → tester
  full_pipeline       → researcher → planner → writer → evaluator
  custom              → caller specifies agents manually
"""

from __future__ import annotations

import re
from app.collaboration.models import AgentTask, CollaborationPlan

# Keyword → strategy mapping
# Order matters — first match wins.
# More specific keywords must come before general ones.
STRATEGY_KEYWORDS: dict[str, list[str]] = {
    "review_and_improve": [
        "review", "improve", "debug", "refactor",
        "quality", "fix bug", "fix issue", "fix error",
    ],
    "analyze_and_report": [
        "analyze", "analyse", "data", "metrics", "insights",
        "trend", "pattern", "statistics", "dashboard",
    ],
    "plan_and_build": [
        "build", "implement", "create", "develop", "code",
        "feature", "api", "service", "backend", "fix",
    ],
    "research_and_write": [
        "research", "report", "summary", "summarize",
        "article", "write", "document", "explain",
    ],
}

# Strategy → agent pipeline definitions
PIPELINES: dict[str, CollaborationPlan] = {}


def _build_pipelines() -> dict[str, CollaborationPlan]:
    return {
        "research_and_write": CollaborationPlan(
            goal="",
            agents=[
                AgentTask(
                    agent_name="researcher",
                    task="",
                    context_from=[],
                ),
                AgentTask(
                    agent_name="writer",
                    task="",
                    depends_on=["researcher"],
                    context_from=["researcher"],
                ),
                AgentTask(
                    agent_name="evaluator",
                    task="",
                    depends_on=["writer"],
                    context_from=["researcher", "writer"],
                ),
            ],
            groups=[["researcher"], ["writer"], ["evaluator"]],
        ),

        "plan_and_build": CollaborationPlan(
            goal="",
            agents=[
                AgentTask(
                    agent_name="planner",
                    task="",
                    context_from=[],
                ),
                AgentTask(
                    agent_name="architect",
                    task="",
                    depends_on=["planner"],
                    context_from=["planner"],
                ),
                AgentTask(
                    agent_name="backend",
                    task="",
                    depends_on=["architect"],
                    context_from=["planner", "architect"],
                ),
            ],
            groups=[["planner"], ["architect"], ["backend"]],
        ),

        "analyze_and_report": CollaborationPlan(
            goal="",
            agents=[
                AgentTask(
                    agent_name="analyst",
                    task="",
                    context_from=[],
                ),
                AgentTask(
                    agent_name="researcher",
                    task="",
                    context_from=[],
                ),
                AgentTask(
                    agent_name="writer",
                    task="",
                    depends_on=["analyst", "researcher"],
                    context_from=["analyst", "researcher"],
                ),
            ],
            groups=[["analyst", "researcher"], ["writer"]],
        ),

        "review_and_improve": CollaborationPlan(
            goal="",
            agents=[
                AgentTask(
                    agent_name="reviewer",
                    task="",
                    context_from=[],
                ),
                AgentTask(
                    agent_name="tester",
                    task="",
                    context_from=[],
                ),
                AgentTask(
                    agent_name="backend",
                    task="",
                    depends_on=["reviewer", "tester"],
                    context_from=["reviewer", "tester"],
                ),
            ],
            groups=[["reviewer", "tester"], ["backend"]],
        ),

        "full_pipeline": CollaborationPlan(
            goal="",
            agents=[
                AgentTask(agent_name="researcher", task="", context_from=[]),
                AgentTask(agent_name="planner", task="", context_from=[]),
                AgentTask(
                    agent_name="writer",
                    task="",
                    depends_on=["researcher", "planner"],
                    context_from=["researcher", "planner"],
                ),
                AgentTask(
                    agent_name="evaluator",
                    task="",
                    depends_on=["writer"],
                    context_from=["writer"],
                ),
            ],
            groups=[
                ["researcher", "planner"],
                ["writer"],
                ["evaluator"],
            ],
        ),
    }


class CollaborationDispatcher:

    def __init__(self) -> None:
        self._pipelines = _build_pipelines()

    def dispatch(
        self,
        goal: str,
        strategy: str | None = None,
        custom_agents: list[str] | None = None,
    ) -> CollaborationPlan:
        """
        Build a CollaborationPlan for the given goal.

        Strategy selection order:
          1. Explicit strategy parameter
          2. Keyword detection from goal text
          3. Custom agent list
          4. Default: research_and_write
        """
        if custom_agents:
            return self._build_custom(goal, custom_agents)

        chosen = strategy or self._detect_strategy(goal)
        plan   = self._pipelines.get(chosen)

        if not plan:
            plan = self._pipelines["research_and_write"]

        return self._personalise(plan, goal)

    def _detect_strategy(self, goal: str) -> str:
        goal_lower = goal.lower()
        for strategy, keywords in STRATEGY_KEYWORDS.items():
            if any(kw in goal_lower for kw in keywords):
                return strategy
        return "research_and_write"

    def _personalise(
        self,
        template: CollaborationPlan,
        goal: str,
    ) -> CollaborationPlan:
        """Clone the template and inject the real goal into each task."""
        import copy
        plan = copy.deepcopy(template)
        plan.goal = goal
        for agent_task in plan.agents:
            agent_task.task = goal
        return plan

    def _build_custom(
        self,
        goal: str,
        agent_names: list[str],
    ) -> CollaborationPlan:
        """
        Build a sequential pipeline from a custom agent list.
        Each agent receives the output of the previous one.
        """
        agents: list[AgentTask] = []
        groups: list[list[str]] = []

        for i, name in enumerate(agent_names):
            prev = agent_names[i - 1] if i > 0 else None
            agents.append(AgentTask(
                agent_name=name,
                task=goal,
                depends_on=[prev] if prev else [],
                context_from=[prev] if prev else [],
            ))
            groups.append([name])

        return CollaborationPlan(
            goal=goal,
            agents=agents,
            groups=groups,
        )

    def list_strategies(self) -> list[str]:
        return list(self._pipelines.keys())


dispatcher = CollaborationDispatcher()
