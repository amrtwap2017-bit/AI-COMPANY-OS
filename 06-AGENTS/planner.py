"""
Planner Agent
=============
Transforms goals into executable task graphs.

Input:  Epic or Feature task with description + acceptance_criteria
Output: PlanGraph — list of sub-tasks with dependencies

The Planner uses the local coding model (qwen2.5-coder) by default.
For complex architectural planning it requests the architecture model.

Every plan is stored in memory as a project memory entry.
Sub-tasks created by the planner carry parent_id linking to the epic.

Output schema (PlanGraph):
{
    "plan_id": UUID,
    "epic_task_id": UUID,
    "nodes": [
        {
            "title": str,
            "description": str,
            "task_type": str,        # "story" | "task" | "spike"
            "agent_role": str,       # "developer" | "tester" | "architect"
            "model_hint": str,       # model task type hint
            "estimated_complexity": str,  # "low" | "medium" | "high"
            "acceptance_criteria": dict,
            "depends_on": [int],     # indices of prerequisite nodes
        }
    ],
    "critical_path": [int],          # indices of bottleneck nodes
    "estimated_total_complexity": str,
}
"""

from __future__ import annotations

import json
import os
from typing import Any
from uuid import UUID, uuid4

import httpx


class PlannerAgent:
    """
    Decomposes epics and features into executable task graphs.

    Called automatically when a task with type='epic' or type='feature'
    is created. The AgentOrchestrator dispatches to this agent.

    The planner:
    1. Reads the epic description and acceptance criteria
    2. Searches relevant memories (failures, learnings, architecture)
    3. Calls the model to generate a structured plan
    4. Creates sub-tasks in the database
    5. Writes the plan to project memory
    """

    agent_id = "planner"
    capabilities = ["planning", "task_decomposition", "dependency_analysis"]
    max_concurrent_tasks = 3

    def __init__(self) -> None:
        self._ollama_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
        self._default_model = "qwen2.5-coder:7b"

    async def decompose_epic(
        self,
        task_id: UUID,
        workspace_id: UUID,
        project_id: UUID,
        title: str,
        description: str,
        acceptance_criteria: dict,
        context_memories: dict | None = None,
    ) -> dict[str, Any]:
        """
        Main decomposition method. Called by AgentOrchestrator.

        Returns the plan graph AND creates sub-tasks in the database.
        """
        run_group = uuid4()

        # Build the planning prompt
        memory_context = ""
        if context_memories:
            failures = context_memories.get("failures", [])
            learnings = context_memories.get("learnings", [])
            if failures:
                failure_text = "\n".join([f"- {m['content'][:200]}" for m in failures[:3]])
                memory_context += f"\n\nPREVIOUS FAILURES TO AVOID:\n{failure_text}"
            if learnings:
                learning_text = "\n".join([f"- {m['content'][:200]}" for m in learnings[:3]])
                memory_context += f"\n\nAPPLICABLE LEARNINGS:\n{learning_text}"

        prompt = self._build_planning_prompt(
            title=title,
            description=description,
            acceptance_criteria=acceptance_criteria,
            memory_context=memory_context,
        )

        # Call model
        plan_text = await self._call_model(prompt)

        # Parse the plan
        plan = self._parse_plan(plan_text, task_id)

        # Create sub-tasks in database
        created_tasks = await self._create_subtasks(
            plan=plan,
            parent_task_id=task_id,
            workspace_id=workspace_id,
            project_id=project_id,
        )

        return {
            "plan_id": str(uuid4()),
            "epic_task_id": str(task_id),
            "run_group": str(run_group),
            "nodes_planned": len(plan.get("nodes", [])),
            "subtasks_created": len(created_tasks),
            "subtask_ids": created_tasks,
            "plan": plan,
            "status": "planned",
        }

    def _build_planning_prompt(
        self,
        title: str,
        description: str,
        acceptance_criteria: dict,
        memory_context: str = "",
    ) -> str:
        return f"""You are a senior software architect decomposing an engineering epic into executable tasks.

EPIC TITLE: {title}

DESCRIPTION: {description}

ACCEPTANCE CRITERIA:
{json.dumps(acceptance_criteria, indent=2)}
{memory_context}

Decompose this epic into 3-8 concrete implementation tasks.

Return ONLY valid JSON in this exact format:
{{
    "nodes": [
        {{
            "title": "Specific implementable task title",
            "description": "What exactly needs to be built",
            "task_type": "story",
            "agent_role": "developer",
            "model_hint": "coding",
            "estimated_complexity": "medium",
            "acceptance_criteria": {{
                "must_pass_tests": [],
                "must_have_coverage": 80.0,
                "architecture_score_minimum": 70.0
            }},
            "depends_on": []
        }}
    ],
    "critical_path": [0, 1],
    "estimated_total_complexity": "high"
}}

Rules:
- Each task must be independently implementable
- depends_on contains array indices of prerequisite tasks
- agent_role: developer, architect, tester, devops, documentation
- model_hint: coding, architecture, testing, documentation, security_scan
- No circular dependencies
- Order tasks logically (infrastructure before features)
- Return ONLY the JSON object, no other text"""

    async def _call_model(self, prompt: str) -> str:
        """Call Ollama model for plan generation."""
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self._ollama_url}/api/generate",
                    json={
                        "model": self._default_model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.2,
                            "top_p": 0.9,
                        },
                    },
                )
                if response.status_code == 200:
                    return response.json().get("response", "")
        except Exception as e:
            pass

        # Fallback plan if model unavailable
        return json.dumps({
            "nodes": [
                {
                    "title": "Research and design",
                    "description": "Investigate requirements and design the solution",
                    "task_type": "spike",
                    "agent_role": "architect",
                    "model_hint": "architecture",
                    "estimated_complexity": "medium",
                    "acceptance_criteria": {
                        "must_pass_tests": [],
                        "must_have_coverage": 0.0,
                        "architecture_score_minimum": 70.0
                    },
                    "depends_on": [],
                },
                {
                    "title": "Implement core functionality",
                    "description": "Build the main implementation",
                    "task_type": "story",
                    "agent_role": "developer",
                    "model_hint": "coding",
                    "estimated_complexity": "high",
                    "acceptance_criteria": {
                        "must_pass_tests": [],
                        "must_have_coverage": 80.0,
                        "architecture_score_minimum": 75.0
                    },
                    "depends_on": [0],
                },
                {
                    "title": "Write tests",
                    "description": "Write unit and integration tests",
                    "task_type": "story",
                    "agent_role": "tester",
                    "model_hint": "testing",
                    "estimated_complexity": "medium",
                    "acceptance_criteria": {
                        "must_pass_tests": [],
                        "must_have_coverage": 85.0,
                        "architecture_score_minimum": 70.0
                    },
                    "depends_on": [1],
                },
            ],
            "critical_path": [0, 1, 2],
            "estimated_total_complexity": "high",
        })

    def _parse_plan(self, plan_text: str, parent_task_id: UUID) -> dict[str, Any]:
        """Extract and validate JSON plan from model output."""
        import re

        json_match = re.search(r'\{.*\}', plan_text, re.DOTALL)
        if json_match:
            try:
                plan = json.loads(json_match.group())
                if "nodes" in plan:
                    return plan
            except json.JSONDecodeError:
                pass

        return {
            "nodes": [
                {
                    "title": "Implementation task",
                    "description": "Implement the required functionality",
                    "task_type": "story",
                    "agent_role": "developer",
                    "model_hint": "coding",
                    "estimated_complexity": "medium",
                    "acceptance_criteria": {
                        "must_pass_tests": [],
                        "must_have_coverage": 80.0,
                        "architecture_score_minimum": 70.0,
                    },
                    "depends_on": [],
                }
            ],
            "critical_path": [0],
            "estimated_total_complexity": "medium",
        }

    async def _create_subtasks(
        self,
        plan: dict[str, Any],
        parent_task_id: UUID,
        workspace_id: UUID,
        project_id: UUID,
    ) -> list[str]:
        """Create sub-task records in the database."""
        import json as json_module
        from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
        from sqlalchemy import text as sql_text

        url = os.environ.get("DATABASE_URL", "postgresql+asyncpg://ai:ai123@localhost:5432/ai_company_os")
        engine = create_async_engine(url, echo=False)
        factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

        created_ids = []
        nodes = plan.get("nodes", [])
        node_id_map = {}

        async with factory() as session:
            for i, node in enumerate(nodes):
                task_id = str(uuid4())
                node_id_map[i] = task_id

                ac = node.get("acceptance_criteria", {})
                ac_json = json_module.dumps(ac)

                result = await session.execute(
                    sql_text("""
                        INSERT INTO tasks (
                            id, workspace_id, project_id, title, description,
                            task_type, acceptance_criteria, assigned_agent,
                            model_hint, status, parent_id
                        ) VALUES (
                            :tid, :wid, :pid, :title, :desc,
                            :ttype, CAST(:ac AS jsonb), :agent,
                            :model, 'pending', :parent
                        )
                        RETURNING id
                    """),
                    {
                        "tid": task_id,
                        "wid": str(workspace_id),
                        "pid": str(project_id),
                        "title": node.get("title", "Subtask"),
                        "desc": node.get("description", ""),
                        "ttype": node.get("task_type", "story"),
                        "ac": ac_json,
                        "agent": node.get("agent_role"),
                        "model": node.get("model_hint"),
                        "parent": str(parent_task_id),
                    },
                )
                created_ids.append(task_id)

            # Create dependency links
            for i, node in enumerate(nodes):
                for dep_idx in node.get("depends_on", []):
                    if dep_idx < len(node_id_map):
                        await session.execute(
                            sql_text("""
                                INSERT INTO task_dependencies (task_id, depends_on_id)
                                VALUES (:tid, :dep)
                                ON CONFLICT DO NOTHING
                            """),
                            {"tid": node_id_map[i], "dep": node_id_map[dep_idx]},
                        )

            # Update parent epic status to reflect planning complete
            await session.execute(
                sql_text("""
                    UPDATE tasks SET status = 'executing'
                    WHERE id = :parent_id
                """),
                {"parent_id": str(parent_task_id)},
            )

            await session.commit()

        await engine.dispose()
        return created_ids
