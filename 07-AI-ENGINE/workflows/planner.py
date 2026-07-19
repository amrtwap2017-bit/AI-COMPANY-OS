"""
Workflow Planner
─────────────────────────────────────────────────────
Takes a high-level goal and breaks it into
a structured task graph with agent assignments.

Two modes:
  1. Template-based: predefined workflows for common goals
  2. AI-based: uses the planner agent to generate tasks
"""

from workflows.models import WorkflowDefinition, Task
from workflows.templates import get_template
from agents.registry import get_agent
from models.router import model_router
from services.ollama import ollama_service

import json
import re


class WorkflowPlanner:

    def plan_from_template(
        self,
        template_name: str,
        goal: str,
        context: dict | None = None,
    ) -> WorkflowDefinition:
        """
        Use a predefined template.
        Fast and reliable for known workflows.
        """
        template = get_template(template_name)
        if not template:
            raise ValueError(f"Template '{template_name}' not found")
        return template(goal=goal, context=context or {})

    def plan_with_ai(self, goal: str) -> WorkflowDefinition:
        """
        Use the planner agent to generate a task graph.
        More flexible but slower.
        """
        agent = get_agent("planner")
        model = model_router.route_with_fallback(goal, agent["model"])

        system = """You are a Workflow Planner AI.
Your job is to break a goal into a list of tasks for specialized agents.

Available agents:
- researcher: deep research and analysis
- architect: system design and architecture
- backend: Python, FastAPI, SQL, APIs
- frontend: UI, React, HTML, CSS
- devops: Docker, deployment, infrastructure
- tester: testing, QA, validation
- reviewer: code review, quality check
- writer: documentation, content
- analyst: data analysis, reports
- planner: planning, coordination

Return ONLY valid JSON in this exact format:
{
  "name": "workflow name",
  "description": "what this workflow does",
  "tasks": [
    {
      "id": "task_1",
      "name": "Task name",
      "agent": "agent_name",
      "instruction": "Detailed instruction for the agent",
      "depends_on": []
    },
    {
      "id": "task_2",
      "name": "Task name",
      "agent": "agent_name",
      "instruction": "Instruction referencing task_1 results",
      "depends_on": ["task_1"]
    }
  ]
}

Rules:
- Maximum 6 tasks
- Each task must have a unique id
- depends_on must reference valid task ids
- Instructions must be specific and actionable
"""

        prompt = f"Create a workflow plan for this goal: {goal}"

        response = ollama_service.generate(
            model=model,
            prompt=prompt,
            system=system,
        )

        return self._parse_ai_response(goal, response)

    def _parse_ai_response(
        self, goal: str, response: str
    ) -> WorkflowDefinition:
        """
        Parse JSON from AI response.
        Falls back to a simple single-task workflow on failure.
        """
        try:
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if not json_match:
                raise ValueError("No JSON found in response")

            data = json.loads(json_match.group())
            tasks = []

            for t in data.get("tasks", []):
                tasks.append(Task(
                    id=t["id"],
                    name=t["name"],
                    agent=t["agent"],
                    instruction=t["instruction"],
                    depends_on=t.get("depends_on", []),
                ))

            return WorkflowDefinition(
                name=data.get("name", "AI Generated Workflow"),
                goal=goal,
                description=data.get("description", ""),
                tasks=tasks,
            )

        except Exception as e:
            # Fallback: single researcher task
            return WorkflowDefinition(
                name="Simple Workflow",
                goal=goal,
                description="Fallback single-task workflow",
                tasks=[
                    Task(
                        id="task_1",
                        name="Execute Goal",
                        agent="researcher",
                        instruction=goal,
                        depends_on=[],
                    )
                ],
            )


workflow_planner = WorkflowPlanner()
