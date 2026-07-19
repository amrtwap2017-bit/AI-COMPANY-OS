"""
app/decision/alternatives.py
────────────────────────────────────────────────────────────────
Generates alternative approaches when confidence is low.

No LLM calls — rule-based alternative templates.
Returns 1-3 alternatives based on task type and risk flags.

When confidence is high (≥ 0.7) this returns an empty list
and zero processing time is spent.
"""

from __future__ import annotations

import re
from decision.models import DecisionInput, Alternative, RiskFlag

# Task type → alternative approaches
ALTERNATIVES_BY_TYPE: dict[str, list[dict]] = {
    "research": [
        {
            "approach": "Use a multi-agent research pipeline",
            "rationale": "researcher + analyst in parallel gives broader coverage",
            "agents": ["researcher", "analyst"],
        },
        {
            "approach": "Break into sub-questions first",
            "rationale": "Planner decomposes the topic before researcher executes",
            "agents": ["planner", "researcher"],
        },
    ],
    "write": [
        {
            "approach": "Research before writing",
            "rationale": "Researcher gathers facts first, writer produces structured output",
            "agents": ["researcher", "writer"],
        },
        {
            "approach": "Draft → Review → Revise pipeline",
            "rationale": "Reviewer catches gaps in the initial draft",
            "agents": ["writer", "reviewer"],
        },
    ],
    "build": [
        {
            "approach": "Architect before coding",
            "rationale": "Design the structure before implementation reduces rework",
            "agents": ["architect", "backend"],
        },
        {
            "approach": "TDD approach: tests first",
            "rationale": "Tester defines requirements, backend implements to pass them",
            "agents": ["tester", "backend"],
        },
    ],
    "analyze": [
        {
            "approach": "Multi-analyst parallel approach",
            "rationale": "Analyst + researcher cover quantitative and qualitative aspects",
            "agents": ["analyst", "researcher"],
        },
    ],
    "plan": [
        {
            "approach": "Research before planning",
            "rationale": "Researcher validates assumptions, planner creates informed plan",
            "agents": ["researcher", "planner"],
        },
    ],
    "review": [
        {
            "approach": "Parallel review + test",
            "rationale": "Reviewer and tester run simultaneously for comprehensive coverage",
            "agents": ["reviewer", "tester"],
        },
    ],
}

# Generic alternatives for any task type
GENERIC_ALTERNATIVES = [
    {
        "approach": "Use a different model",
        "rationale": "Switch to a reasoning model (deepseek-r1:8b) for better quality",
        "agents": [],
    },
    {
        "approach": "Decompose into smaller tasks",
        "rationale": "Planner breaks the goal into atomic steps before execution",
        "agents": ["planner"],
    },
]


class AlternativesGenerator:

    def generate(
        self,
        inp: DecisionInput,
        confidence: float,
        risk_flags: list[RiskFlag],
    ) -> list[Alternative]:
        """
        Generate alternative approaches.
        Returns empty list if confidence is high.
        """
        if confidence >= 0.7 and not self._has_high_risk(risk_flags):
            return []

        task_type = self._detect_task_type(inp.task)
        raw = ALTERNATIVES_BY_TYPE.get(task_type, []) + GENERIC_ALTERNATIVES

        # Cap at 3 alternatives
        selected = raw[:3]

        return [
            Alternative(
                approach=a["approach"],
                rationale=a["rationale"],
                agents=a["agents"],
            )
            for a in selected
        ]

    def _detect_task_type(self, task: str) -> str:
        task_lower = task.lower()
        type_keywords = {
            "research":  ["research", "investigate", "study", "explore"],
            "write":     ["write", "draft", "compose", "create", "document"],
            "build":     ["build", "implement", "develop", "code", "create api"],
            "analyze":   ["analyze", "analyse", "examine", "review data"],
            "plan":      ["plan", "roadmap", "schedule", "organize", "structure"],
            "review":    ["review", "audit", "check", "inspect", "debug"],
        }
        for task_type, keywords in type_keywords.items():
            if any(kw in task_lower for kw in keywords):
                return task_type
        return "research"  # default

    def _has_high_risk(self, flags: list[RiskFlag]) -> bool:
        from decision.models import RiskLevel
        return any(
            f.severity in (RiskLevel.HIGH, RiskLevel.CRITICAL)
            for f in flags
        )
