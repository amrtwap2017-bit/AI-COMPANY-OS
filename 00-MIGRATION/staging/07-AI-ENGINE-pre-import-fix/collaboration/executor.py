"""
app/collaboration/executor.py
────────────────────────────────────────────────────────────────
Runs agent tasks in parallel within each execution group.

Design:
  - Each group is a set of agents that can run concurrently.
  - Uses ThreadPoolExecutor (Ollama calls are synchronous).
  - Timeout per agent: 300 seconds.
  - Failed agents do not stop the pipeline — partial results allowed.
  - Outputs from earlier groups are injected into later agents as context.
"""

from __future__ import annotations

import logging
import time
from concurrent.futures import ThreadPoolExecutor, as_completed, Future

from app.collaboration.models import (
    AgentTask,
    AgentOutput,
    CollaborationPlan,
)
from app.agents.registry import get_agent
from app.models.router import model_router
from app.services.ollama import ollama_service
from app.core.prompt_loader import load_prompt_with_fallback

log = logging.getLogger(__name__)

AGENT_TIMEOUT = 300   # seconds per agent
MAX_WORKERS   = 4     # max parallel agents


class CollaborationExecutor:

    def execute(
        self,
        plan: CollaborationPlan,
    ) -> list[AgentOutput]:
        """
        Execute all agent groups in the plan.
        Returns a flat list of AgentOutput, one per agent.
        """
        all_outputs: dict[str, AgentOutput] = {}

        for group_idx, group in enumerate(plan.groups):
            log.info(
                "Executing group %d: %s",
                group_idx + 1,
                group,
            )

            # Collect tasks for this group
            group_tasks = [
                t for t in plan.agents
                if t.agent_name in group
            ]

            # Run group in parallel
            group_outputs = self._run_group(
                tasks=group_tasks,
                completed_outputs=all_outputs,
            )

            # Merge into overall results
            for output in group_outputs:
                all_outputs[output.agent_name] = output

            # Log group results
            succeeded = sum(1 for o in group_outputs if o.success)
            log.info(
                "Group %d complete: %d/%d succeeded",
                group_idx + 1, succeeded, len(group),
            )

        return list(all_outputs.values())

    def _run_group(
        self,
        tasks: list[AgentTask],
        completed_outputs: dict[str, AgentOutput],
    ) -> list[AgentOutput]:
        """Run a group of tasks in parallel."""
        if not tasks:
            return []

        if len(tasks) == 1:
            return [self._run_task(tasks[0], completed_outputs)]

        results: list[AgentOutput] = []
        futures: dict[Future, AgentTask] = {}

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
            for task in tasks:
                future = pool.submit(
                    self._run_task, task, completed_outputs
                )
                futures[future] = task

            for future in as_completed(futures, timeout=AGENT_TIMEOUT + 30):
                task = futures[future]
                try:
                    output = future.result(timeout=5)
                    results.append(output)
                except Exception as exc:
                    log.error(
                        "Agent %s raised: %s",
                        task.agent_name, exc,
                    )
                    results.append(AgentOutput(
                        agent_name=task.agent_name,
                        task=task.task,
                        output="",
                        model_used="unknown",
                        success=False,
                        duration_seconds=0.0,
                        error=str(exc),
                    ))

        return results

    def _run_task(
        self,
        task: AgentTask,
        completed_outputs: dict[str, AgentOutput],
    ) -> AgentOutput:
        """Run a single agent task. Never raises."""
        start = time.time()
        log.info("Starting agent: %s", task.agent_name)

        try:
            # Load agent config
            try:
                agent_config = get_agent(task.agent_name)
            except ValueError:
                agent_config = get_agent("researcher")

            # Select model
            model = model_router.route_with_fallback(
                task.task, agent_config["model"]
            )

            # Build system prompt from file
            system = load_prompt_with_fallback(
                task.agent_name,
                fallback_description=agent_config.get("description", ""),
            )

            # Inject context from earlier agents
            context_parts: list[str] = []
            for source_agent in task.context_from:
                source_output = completed_outputs.get(source_agent)
                if source_output and source_output.success:
                    context_parts.append(
                        f"## Output from {source_agent}\n"
                        f"{source_output.output[:2000]}"
                    )

            if context_parts:
                system += (
                    "\n\n## Context from previous agents\n"
                    + "\n\n".join(context_parts)
                )

            # Generate
            output = ollama_service.generate(
                model=model,
                prompt=task.task,
                system=system,
            )

            duration = time.time() - start
            log.info(
                "Agent %s complete in %.1fs",
                task.agent_name, duration,
            )

            return AgentOutput(
                agent_name=task.agent_name,
                task=task.task,
                output=output,
                model_used=model,
                success=True,
                duration_seconds=round(duration, 2),
            )

        except Exception as exc:
            duration = time.time() - start
            log.error("Agent %s failed: %s", task.agent_name, exc)
            return AgentOutput(
                agent_name=task.agent_name,
                task=task.task,
                output="",
                model_used="unknown",
                success=False,
                duration_seconds=round(duration, 2),
                error=str(exc),
            )
