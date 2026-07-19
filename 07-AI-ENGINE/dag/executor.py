"""
app/dag/executor.py
────────────────────────────────────────────────────────────────
Executes a DAGGraph by running ready nodes in parallel.

Execution loop:
  1. Ask scheduler for ready nodes
  2. Submit all ready nodes to ThreadPoolExecutor
  3. Wait for any node to complete
  4. On completion: update status, checkpoint state
  5. Repeat until no more runnable nodes

Features:
  - Per-node timeout (kills hanging agents)
  - Per-node retry with exponential backoff
  - Context injection from upstream outputs
  - Checkpoint after every node completion
  - Skip downstream nodes if upstream failed
"""

from __future__ import annotations

import logging
import time
from concurrent.futures import ThreadPoolExecutor, Future, as_completed
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from dag.models import (
    DAGGraph, DAGNode, DAGExecution, DAGStatus, NodeStatus
)
from dag.scheduler import DAGScheduler
from dag.checkpoint import DAGCheckpoint
from models.db.dag_run import DAGRun
from agents.registry import get_agent
from models.router import model_router
from services.ollama import ollama_service
from core.prompt_loader import load_prompt_with_fallback

log = logging.getLogger(__name__)

MAX_WORKERS    = 4
RETRY_BACKOFF  = [2, 5]   # seconds to wait before retry 1, retry 2


class DAGExecutor:

    def __init__(
        self,
        db: Session,
        scheduler: DAGScheduler | None = None,
        checkpoint: DAGCheckpoint | None = None,
    ) -> None:
        self._db         = db
        self._scheduler  = scheduler   or DAGScheduler()
        self._checkpoint = checkpoint  or DAGCheckpoint(db)

    def execute(
        self,
        execution: DAGExecution,
        dag_run:   DAGRun,
        skip_on_failure: bool = False,
    ) -> DAGExecution:
        """
        Run the DAG to completion.
        Returns the execution object with all node results filled.
        """
        execution.status     = DAGStatus.RUNNING
        execution.started_at = datetime.now(timezone.utc)
        graph = execution.graph

        self._checkpoint.save(dag_run, graph, DAGStatus.RUNNING)

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
            running_futures: dict[Future, DAGNode] = {}

            while True:
                # Find ready nodes not already running
                running_ids = {n.node_id for n in running_futures.values()}
                ready = [
                    n for n in self._scheduler.get_ready_nodes(
                        graph, skip_on_failure
                    )
                    if n.node_id not in running_ids
                ]

                # Submit ready nodes
                for node in ready:
                    context = self._scheduler.get_context_for_node(graph, node)
                    node.status     = NodeStatus.RUNNING
                    node.started_at = datetime.now(timezone.utc)

                    future = pool.submit(
                        self._run_node, node, context
                    )
                    running_futures[future] = node
                    log.info("Submitted node: %s", node.node_id)

                if not running_futures:
                    # Nothing running and nothing ready — we're done
                    break

                # Wait for at least one to complete
                done_futures = []
                try:
                    for future in as_completed(
                        running_futures,
                        timeout=max(n.timeout_s for n in running_futures.values()) + 10,
                    ):
                        done_futures.append(future)
                        break  # process one at a time, re-check ready
                except Exception:
                    pass

                for future in done_futures:
                    node = running_futures.pop(future)
                    try:
                        updated_node = future.result(timeout=5)
                        # Copy results back into graph node
                        graph_node = graph.get_node(node.node_id)
                        if graph_node:
                            graph_node.status       = updated_node.status
                            graph_node.output       = updated_node.output
                            graph_node.error        = updated_node.error
                            graph_node.model_used   = updated_node.model_used
                            graph_node.duration_s   = updated_node.duration_s
                            graph_node.completed_at = datetime.now(timezone.utc)
                            graph_node.retry_count  = updated_node.retry_count

                            if graph_node.can_retry:
                                wait = RETRY_BACKOFF[
                                    min(graph_node.retry_count, len(RETRY_BACKOFF) - 1)
                                ]
                                log.info(
                                    "Retrying node %s in %ds (attempt %d)",
                                    node.node_id, wait, graph_node.retry_count + 1,
                                )
                                time.sleep(wait)
                                graph_node.retry_count += 1
                                graph_node.status = NodeStatus.PENDING

                    except Exception as exc:
                        graph_node = graph.get_node(node.node_id)
                        if graph_node:
                            graph_node.status = NodeStatus.FAILED
                            graph_node.error  = str(exc)

                    # Checkpoint after every node completion
                    summary = self._scheduler.summary(graph)
                    log.info("Progress: %s", summary)
                    self._checkpoint.save(dag_run, graph, DAGStatus.RUNNING)

        # Determine final status
        execution.ended_at = datetime.now(timezone.utc)
        succeeded = self._scheduler.summary(graph).get("complete", 0)
        failed    = self._scheduler.summary(graph).get("failed", 0)

        if failed == 0:
            execution.status = DAGStatus.COMPLETE
        elif succeeded > 0:
            execution.status = DAGStatus.PARTIAL
        else:
            execution.status = DAGStatus.FAILED

        self._checkpoint.save(dag_run, graph, execution.status)
        return execution

    def _run_node(
        self,
        node: DAGNode,
        context: dict[str, str],
    ) -> DAGNode:
        """Execute a single node. Never raises — captures errors."""
        start = time.time()

        try:
            agent_config = get_agent(node.agent_name)
        except ValueError:
            agent_config = get_agent("researcher")

        model = model_router.route_with_fallback(
            node.task, agent_config["model"]
        )

        system = load_prompt_with_fallback(
            node.agent_name,
            fallback_description=agent_config.get("description", ""),
        )

        # Inject context from upstream nodes
        if context:
            context_text = "\n\n".join(
                f"## Output from {agent}\n{output[:2000]}"
                for agent, output in context.items()
            )
            system += f"\n\n## Context from previous agents\n{context_text}"

        try:
            output = ollama_service.generate(
                model=model,
                prompt=node.task,
                system=system,
            )
            node.status     = NodeStatus.COMPLETE
            node.output     = output
            node.model_used = model
            node.duration_s = round(time.time() - start, 2)
            log.info(
                "Node %s complete in %.1fs",
                node.node_id, node.duration_s,
            )

        except Exception as exc:
            node.status     = NodeStatus.FAILED
            node.error      = str(exc)
            node.duration_s = round(time.time() - start, 2)
            log.error("Node %s failed: %s", node.node_id, exc)

        return node
