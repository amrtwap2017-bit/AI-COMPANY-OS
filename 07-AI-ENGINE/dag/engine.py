"""
app/dag/engine.py
────────────────────────────────────────────────────────────────
Top-level entry point for DAG execution.

Pipeline:
  1. Build DAGGraph from pattern or agent list
  2. Create DAGRun DB record
  3. Execute with DAGExecutor (parallel, with checkpoints)
  4. Assemble final output from completed nodes
  5. Track analytics + reflections per node
  6. Return DAGExecution result
"""

from __future__ import annotations

import json
import logging

from sqlalchemy.orm import Session

from dag.models import DAGGraph, DAGExecution, DAGStatus, NodeStatus
from dag.builder import DAGBuilder
from dag.executor import DAGExecutor
from dag.checkpoint import DAGCheckpoint
from dag.scheduler import DAGScheduler
from models.db.dag_run import DAGRun

log = logging.getLogger(__name__)


class DAGEngine:

    def __init__(self, db: Session) -> None:
        self._db         = db
        self._builder    = DAGBuilder()
        self._scheduler  = DAGScheduler()
        self._checkpoint = DAGCheckpoint(db)

    def run(
        self,
        goal:            str,
        pattern:         str | None = None,
        agents:          list[str] | None = None,
        sequential:      bool = False,
        skip_on_failure: bool = False,
        timeout_s:       int  = 300,
        max_retries:     int  = 1,
    ) -> DAGExecution:
        """
        Build and execute a DAG for the given goal.

        Priority order for graph construction:
          1. agents list provided → build from agent list
          2. pattern provided     → use named pattern
          3. default              → research_and_write pattern
        """
        # 1. Build graph
        if agents:
            graph = self._builder.from_agent_list(
                goal=goal,
                agents=agents,
                sequential=sequential,
                timeout_s=timeout_s,
                max_retries=max_retries,
            )
            pattern = "custom"
        else:
            chosen_pattern = pattern or "research_and_write"
            graph = self._builder.from_pattern(
                goal=goal,
                pattern=chosen_pattern,
                timeout_s=timeout_s,
                max_retries=max_retries,
            )
            pattern = chosen_pattern

        # 2. Create DB record
        dag_run = self._create_run(goal, pattern, graph)

        # 3. Execute
        execution = DAGExecution(dag_id=dag_run.id, graph=graph)
        executor  = DAGExecutor(
            db=self._db,
            scheduler=self._scheduler,
            checkpoint=self._checkpoint,
        )
        execution = executor.execute(
            execution=execution,
            dag_run=dag_run,
            skip_on_failure=skip_on_failure,
        )

        # 4. Assemble final output
        final_output = self._assemble_output(execution)

        # 5. Update DB record
        self._complete_run(dag_run, execution, final_output)

        # 6. Track per-node analytics + reflections
        self._track_all(execution)

        return execution

    def get_run(self, dag_id: int) -> DAGRun | None:
        return self._db.query(DAGRun).filter(
            DAGRun.id == dag_id
        ).first()

    def list_runs(self, limit: int = 20) -> list[DAGRun]:
        return (
            self._db.query(DAGRun)
            .order_by(DAGRun.created_at.desc())
            .limit(limit)
            .all()
        )

    def list_patterns(self) -> list[str]:
        return self._builder.list_patterns()

    # ── Private ───────────────────────────────────────────────

    def _create_run(
        self,
        goal: str,
        pattern: str,
        graph: DAGGraph,
    ) -> DAGRun:
        graph_def = {
            "nodes": [
                {
                    "node_id":    n.node_id,
                    "agent_name": n.agent_name,
                    "priority":   n.priority,
                    "timeout_s":  n.timeout_s,
                    "max_retries": n.max_retries,
                }
                for n in graph.nodes
            ],
            "edges": [
                {"from": e.from_id, "to": e.to_id}
                for e in graph.edges
            ],
        }
        run = DAGRun(
            goal=goal,
            pattern=pattern,
            status=DAGStatus.PENDING.value,
            total_nodes=len(graph.nodes),
            graph_definition=graph_def,
        )
        self._db.add(run)
        self._db.commit()
        self._db.refresh(run)
        return run

    def _complete_run(
        self,
        dag_run: DAGRun,
        execution: DAGExecution,
        final_output: str,
    ) -> None:
        dag_run.status           = execution.status.value
        dag_run.completed_nodes  = execution.succeeded_count
        dag_run.failed_nodes     = execution.failed_count
        dag_run.total_duration_s = round(execution.total_duration, 2)
        dag_run.final_output     = final_output[:5000]
        self._db.commit()

    def _assemble_output(self, execution: DAGExecution) -> str:
        """
        Combine node outputs into a final response.
        Writer/evaluator nodes take priority.
        """
        graph = execution.graph

        PRIMARY   = {"writer", "developer", "backend"}
        META      = {"evaluator", "reviewer"}

        primary_output = ""
        meta_outputs:  list[str] = []
        all_outputs:   list[str] = []

        for node in graph.nodes:
            if not node.succeeded or not node.output:
                continue

            if node.agent_name in PRIMARY and not primary_output:
                primary_output = node.output
            elif node.agent_name in META:
                meta_outputs.append(
                    f"**{node.agent_name.title()} review:**\n{node.output[:500]}"
                )
            else:
                all_outputs.append(
                    f"## {node.agent_name.title()}\n{node.output}"
                )

        if primary_output:
            sections = [primary_output]
            if meta_outputs:
                sections.append("\n---\n" + "\n\n".join(meta_outputs))
            return "\n\n".join(sections)

        if all_outputs:
            header = f"# DAG Result\n**Goal:** {execution.graph.goal}\n"
            return header + "\n\n".join(all_outputs)

        return f"No successful output for goal: {execution.graph.goal}"

    def _track_all(self, execution: DAGExecution) -> None:
        """Fire analytics + reflections for all completed nodes."""
        for node in execution.graph.nodes:
            try:
                from analytics.tracker import track_agent_call
                track_agent_call(
                    agent_name=node.agent_name,
                    model_used=node.model_used or "unknown",
                    user_input=node.task,
                    output=node.output or "",
                    duration=node.duration_s,
                    success=node.succeeded,
                )
            except Exception as exc:
                log.debug("DAG analytics failed: %s", exc)

            try:
                from reflection.engine import ReflectionEngine
                from reflection.models import ExecutionRecord
                ReflectionEngine(self._db).reflect(ExecutionRecord(
                    agent_name=node.agent_name,
                    model_used=node.model_used or "unknown",
                    task=node.task,
                    output=node.output or "",
                    status="success" if node.succeeded else "failed",
                    duration_seconds=node.duration_s,
                    error=node.error,
                ))
            except Exception as exc:
                log.debug("DAG reflection failed: %s", exc)
