"""
app/dag/models.py
────────────────────────────────────────────────────────────────
Data shapes for the Execution DAG.

A DAG (Directed Acyclic Graph) represents a workflow where:
  - Nodes are agent tasks
  - Edges are dependencies (A → B means B waits for A)
  - Groups of nodes with no unmet deps run in parallel
  - The graph is validated to have no cycles before execution
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime


class NodeStatus(str, Enum):
    PENDING   = "pending"    # waiting for dependencies
    READY     = "ready"      # all deps complete, can run
    RUNNING   = "running"    # currently executing
    COMPLETE  = "complete"   # finished successfully
    FAILED    = "failed"     # execution error
    SKIPPED   = "skipped"    # upstream failed, skipped
    CANCELLED = "cancelled"  # explicitly cancelled
    TIMEOUT   = "timeout"    # exceeded time limit


class DAGStatus(str, Enum):
    PENDING   = "pending"
    RUNNING   = "running"
    COMPLETE  = "complete"   # all nodes complete
    PARTIAL   = "partial"    # some failed, some complete
    FAILED    = "failed"     # critical failure
    CANCELLED = "cancelled"


@dataclass
class DAGNode:
    """One task in the execution graph."""
    node_id:      str           # unique within the DAG
    agent_name:   str           # which agent runs this
    task:         str           # what to do
    priority:     int   = 5     # 1 (highest) to 10 (lowest)
    timeout_s:    int   = 300   # seconds before timeout
    max_retries:  int   = 1     # retry count on failure
    retry_count:  int   = 0     # current attempt number
    status:       NodeStatus = NodeStatus.PENDING
    output:       str   = ""
    error:        str | None = None
    model_used:   str   = ""
    duration_s:   float = 0.0
    started_at:   datetime | None = None
    completed_at: datetime | None = None

    @property
    def is_done(self) -> bool:
        return self.status in (
            NodeStatus.COMPLETE,
            NodeStatus.FAILED,
            NodeStatus.SKIPPED,
            NodeStatus.CANCELLED,
            NodeStatus.TIMEOUT,
        )

    @property
    def succeeded(self) -> bool:
        return self.status == NodeStatus.COMPLETE

    @property
    def can_retry(self) -> bool:
        return (
            self.status == NodeStatus.FAILED
            and self.retry_count < self.max_retries
        )


@dataclass
class DAGEdge:
    """Dependency between two nodes. from_id must complete before to_id runs."""
    from_id: str   # upstream node
    to_id:   str   # downstream node (waits for from_id)


@dataclass
class DAGGraph:
    """
    Complete execution graph.
    Nodes + edges define the full dependency structure.
    """
    goal:  str
    nodes: list[DAGNode]          = field(default_factory=list)
    edges: list[DAGEdge]          = field(default_factory=list)

    def get_node(self, node_id: str) -> DAGNode | None:
        return next((n for n in self.nodes if n.node_id == node_id), None)

    def get_dependencies(self, node_id: str) -> list[str]:
        """Return node_ids that must complete before node_id can run."""
        return [e.from_id for e in self.edges if e.to_id == node_id]

    def get_dependents(self, node_id: str) -> list[str]:
        """Return node_ids that wait for node_id."""
        return [e.to_id for e in self.edges if e.from_id == node_id]

    def add_node(self, node: DAGNode) -> None:
        self.nodes.append(node)

    def add_edge(self, from_id: str, to_id: str) -> None:
        self.edges.append(DAGEdge(from_id=from_id, to_id=to_id))


@dataclass
class DAGExecution:
    """Runtime state of a DAG being executed."""
    dag_id:     int
    graph:      DAGGraph
    status:     DAGStatus     = DAGStatus.PENDING
    started_at: datetime | None = None
    ended_at:   datetime | None = None

    @property
    def total_duration(self) -> float:
        if self.started_at and self.ended_at:
            return (self.ended_at - self.started_at).total_seconds()
        return 0.0

    @property
    def succeeded_count(self) -> int:
        return sum(1 for n in self.graph.nodes if n.succeeded)

    @property
    def failed_count(self) -> int:
        return sum(
            1 for n in self.graph.nodes
            if n.status == NodeStatus.FAILED
        )

    @property
    def is_complete(self) -> bool:
        return all(n.is_done for n in self.graph.nodes)
