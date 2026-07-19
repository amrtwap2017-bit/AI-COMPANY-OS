"""
Workflow Templates — AI Company OS
─────────────────────────────────────────────────────
Template design principles:
  1. Research tasks  → researcher (qwen3.5:4b, ~87s)
  2. Writing tasks   → writer (llama3.2:3b, ~15s)
  3. Coding tasks    → backend/devops (qwen2.5-coder:7b, ~60s)
  4. Review tasks    → reviewer (deepseek-r1:8b, ~5min, worth it)
  5. Analysis        → analyst (deepseek-r1:8b, only when needed)

Total workflow time targets:
  research_report    → ~4-6 min  (research + write)
  code_review        → ~6-8 min  (review + feedback)
  feature_dev        → ~6-10 min (design + code + test)
  document_analysis  → ~3-4 min  (extract + summarize)
  system_audit       → ~8-12 min (arch + code + report)
"""

from workflows.models import WorkflowDefinition, Task
from typing import Callable


def research_report(goal: str, context: dict) -> WorkflowDefinition:
    """
    Research a topic and produce a structured report.
    researcher (qwen3.5:4b) → writer (llama3.2:3b)
    Estimated time: 4-6 minutes
    """
    return WorkflowDefinition(
        name="Research Report",
        goal=goal,
        description="Research + professional report writing",
        tasks=[
            Task(
                id="research",
                name="Research Topic",
                agent="researcher",
                instruction=(
                    f"Research this topic thoroughly and provide comprehensive findings: {goal}\n\n"
                    "Cover: key concepts, how it works, current state, "
                    "benefits, limitations, and real-world applications. "
                    "Be specific and detailed."
                ),
                depends_on=[],
            ),
            Task(
                id="write",
                name="Write Professional Report",
                agent="writer",
                instruction=(
                    f"Write a professional report on: {goal}\n\n"
                    "Use the research findings to create a clear, well-structured document with:\n"
                    "1. Executive Summary\n"
                    "2. Key Findings\n"
                    "3. How It Works\n"
                    "4. Benefits and Applications\n"
                    "5. Conclusion\n\n"
                    "Write in clear, professional language."
                ),
                depends_on=["research"],
            ),
        ],
    )


def code_review(goal: str, context: dict) -> WorkflowDefinition:
    """
    Deep code review using best reasoning model.
    reviewer (deepseek-r1:8b) → writer (llama3.2:3b)
    Estimated time: 6-8 minutes
    """
    return WorkflowDefinition(
        name="Code Review",
        goal=goal,
        description="Deep code review with structured feedback",
        tasks=[
            Task(
                id="review",
                name="Deep Code Review",
                agent="reviewer",
                instruction=(
                    f"Perform a thorough code review for: {goal}\n\n"
                    "Analyze: correctness, security vulnerabilities, "
                    "performance issues, best practices violations, "
                    "edge cases, error handling, and maintainability. "
                    "Be specific with line-level feedback where possible."
                ),
                depends_on=[],
            ),
            Task(
                id="report",
                name="Write Review Report",
                agent="writer",
                instruction=(
                    "Write a clear, actionable code review report.\n\n"
                    "Structure:\n"
                    "1. Overall Assessment\n"
                    "2. Critical Issues (must fix)\n"
                    "3. Major Issues (should fix)\n"
                    "4. Minor Issues (nice to fix)\n"
                    "5. Positive Observations\n"
                    "6. Recommended Actions\n\n"
                    "Be specific and actionable."
                ),
                depends_on=["review"],
            ),
        ],
    )


def feature_development(goal: str, context: dict) -> WorkflowDefinition:
    """
    End-to-end feature development.
    architect (qwen3.5:4b) → backend (qwen2.5-coder:7b) → writer (llama3.2:3b)
    Estimated time: 6-10 minutes
    """
    return WorkflowDefinition(
        name="Feature Development",
        goal=goal,
        description="Architecture + implementation + documentation",
        tasks=[
            Task(
                id="design",
                name="Design Architecture",
                agent="architect",
                instruction=(
                    f"Design the technical specification for: {goal}\n\n"
                    "Provide: system design, data models, API endpoints, "
                    "technology choices, and implementation approach. "
                    "Be specific enough for a developer to implement."
                ),
                depends_on=[],
            ),
            Task(
                id="implement",
                name="Implement Feature",
                agent="backend",
                instruction=(
                    f"Implement the feature based on the architecture design: {goal}\n\n"
                    "Provide complete, working code with:\n"
                    "- All necessary functions and classes\n"
                    "- Error handling\n"
                    "- Type hints\n"
                    "- Brief inline comments for complex logic"
                ),
                depends_on=["design"],
            ),
            Task(
                id="document",
                name="Write Documentation",
                agent="writer",
                instruction=(
                    f"Write clear developer documentation for: {goal}\n\n"
                    "Include: overview, setup, API reference, usage examples, "
                    "and common patterns. Make it easy for developers to use."
                ),
                depends_on=["implement"],
            ),
        ],
    )


def document_analysis(goal: str, context: dict) -> WorkflowDefinition:
    """
    Analyze documents and extract insights.
    researcher (qwen3.5:4b) → writer (llama3.2:3b)
    Estimated time: 3-4 minutes
    """
    return WorkflowDefinition(
        name="Document Analysis",
        goal=goal,
        description="Extract insights and create executive summary",
        tasks=[
            Task(
                id="analyze",
                name="Analyze and Extract",
                agent="researcher",
                instruction=(
                    f"Analyze this document/topic and extract all key information: {goal}\n\n"
                    "Extract: main themes, key facts, important data points, "
                    "conclusions, and actionable insights."
                ),
                depends_on=[],
            ),
            Task(
                id="summarize",
                name="Write Executive Summary",
                agent="writer",
                instruction=(
                    "Write a concise executive summary with:\n"
                    "1. Key Findings (bullet points)\n"
                    "2. Main Insights\n"
                    "3. Recommended Actions\n\n"
                    "Keep it clear and actionable. Maximum 500 words."
                ),
                depends_on=["analyze"],
            ),
        ],
    )


def system_audit(goal: str, context: dict) -> WorkflowDefinition:
    """
    System audit with deep review.
    architect (qwen3.5:4b) + reviewer (deepseek-r1:8b) → writer (llama3.2:3b)
    Estimated time: 8-12 minutes (parallel arch + code, then report)
    """
    return WorkflowDefinition(
        name="System Audit",
        goal=goal,
        description="Architecture review + code audit + audit report",
        tasks=[
            Task(
                id="arch_review",
                name="Architecture Review",
                agent="architect",
                instruction=(
                    f"Review the system architecture for: {goal}\n\n"
                    "Evaluate: design patterns, scalability, maintainability, "
                    "separation of concerns, and architectural debt. "
                    "Identify specific improvement opportunities."
                ),
                depends_on=[],
            ),
            Task(
                id="code_audit",
                name="Code Quality Audit",
                agent="reviewer",
                instruction=(
                    f"Audit the codebase quality for: {goal}\n\n"
                    "Check: code quality, security, performance, test coverage, "
                    "documentation quality, and technical debt. "
                    "Rate each area and provide specific findings."
                ),
                depends_on=[],
            ),
            Task(
                id="report",
                name="Compile Audit Report",
                agent="writer",
                instruction=(
                    "Compile all audit findings into a professional audit report.\n\n"
                    "Structure:\n"
                    "1. Executive Summary\n"
                    "2. Architecture Assessment\n"
                    "3. Code Quality Assessment\n"
                    "4. Risk Rating (High/Medium/Low for each finding)\n"
                    "5. Priority Recommendations\n"
                    "6. Roadmap for Improvements\n\n"
                    "Be specific and prioritize by impact."
                ),
                depends_on=["arch_review", "code_audit"],
            ),
        ],
    )


TEMPLATES: dict[str, Callable] = {
    "research_report":     research_report,
    "code_review":         code_review,
    "feature_development": feature_development,
    "document_analysis":   document_analysis,
    "system_audit":        system_audit,
}


def get_template(name: str) -> Callable | None:
    return TEMPLATES.get(name)


def list_templates() -> list[dict]:
    return [
        {
            "name": name,
            "description": fn("", {}).description,
            "task_count": len(fn("", {}).tasks),
        }
        for name, fn in TEMPLATES.items()
    ]
