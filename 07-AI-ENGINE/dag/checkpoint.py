"""
app/dag/checkpoint.py
────────────────────────────────────────────────────────────────
Saves and restores DAG execution state.

Allows long-running DAGs to survive process restarts.
State is stored as JSON in the dag_runs.checkpoint_data column.

Checkpoint is written after EVERY node completes.
On resume, already-complete nodes are not re-run.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime

from sqlalchemy.orm import Session

from dag.models import DAGGraph, DAGNode, NodeStatus, DAGStatus
from models.db.dag_run import DAGRun

log = logging.getLogger(__name__)


class DAGCheckpoint:

    def __init__(self, db: Session) -> None:
        self._db = db

    def save(
        self,
        dag_run: DAGRun,
        graph: DAGGraph,
        status: DAGStatus,
    ) -> None:
        """Persist current execution state to the database."""
        try:
            checkpoint = {
                "status": status.value,
                "nodes": {
                    node.node_id: {
                        "status":       node.status.value,
                        "output":       node.output[:1000] if node.output else "",
                        "error":        node.error,
                        "model_used":   node.model_used,
                        "duration_s":   node.duration_s,
                        "retry_count":  node.retry_count,
                    }
                    for node in graph.nodes
                },
                "saved_at": datetime.utcnow().isoformat(),
            }
            dag_run.checkpoint_data = checkpoint
            dag_run.status = status.value
            self._db.commit()
        except Exception as exc:
            log.debug("Checkpoint save failed: %s", exc)

    def restore(
        self,
        graph: DAGGraph,
        dag_run: DAGRun,
    ) -> None:
        """
        Restore node states from a saved checkpoint.
        Nodes already marked COMPLETE will not be re-run.
        """
        if not dag_run.checkpoint_data:
            return

        checkpoint = dag_run.checkpoint_data
        node_states = checkpoint.get("nodes", {})

        for node in graph.nodes:
            saved = node_states.get(node.node_id)
            if not saved:
                continue

            saved_status = saved.get("status", "pending")

            # Only restore terminal states — do not restore RUNNING
            # (a RUNNING state at restore time means the process died)
            if saved_status in ("complete", "failed", "skipped", "cancelled"):
                node.status     = NodeStatus(saved_status)
                node.output     = saved.get("output", "")
                node.error      = saved.get("error")
                node.model_used = saved.get("model_used", "")
                node.duration_s = saved.get("duration_s", 0.0)
                node.retry_count = saved.get("retry_count", 0)

        log.info(
            "Checkpoint restored: %d nodes",
            sum(1 for n in graph.nodes if n.is_done),
        )
