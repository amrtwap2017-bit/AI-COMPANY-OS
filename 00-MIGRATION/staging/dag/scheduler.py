"""
app/dag/scheduler.py
────────────────────────────────────────────────────────────────
Determines which nodes are ready to run.

A node is READY when:
  1. Its status is PENDING
  2. ALL its dependency nodes have status COMPLETE

A node is SKIPPED when:
  - Any of its dependencies FAILED and skip_on_failure=True

The scheduler does not execute — it only classifies nodes.
The executor calls the scheduler each round to find what to run next.
"""

from __future__ import annotations

from app.dag.models import DAGGraph, DAGNode, NodeStatus


class DAGScheduler:

    def get_ready_nodes(
        self,
        graph: DAGGraph,
        skip_on_failure: bool = False,
    ) -> list[DAGNode]:
        """
        Return all nodes that are ready to run right now.
        Sorted by priority (1 = highest).
        """
        ready: list[DAGNode] = []

        for node in graph.nodes:
            if node.status != NodeStatus.PENDING:
                continue

            deps = graph.get_dependencies(node.node_id)

            if not deps:
                # No dependencies — immediately ready
                ready.append(node)
                continue

            dep_nodes = [graph.get_node(d) for d in deps]
            dep_nodes = [n for n in dep_nodes if n is not None]

            # Check for upstream failures
            if skip_on_failure:
                if any(
                    n.status in (NodeStatus.FAILED, NodeStatus.SKIPPED)
                    for n in dep_nodes
                ):
                    node.status = NodeStatus.SKIPPED
                    continue

            # Check all deps completed
            if all(n.status == NodeStatus.COMPLETE for n in dep_nodes):
                ready.append(node)

        # Sort by priority (lower number = higher priority)
        return sorted(ready, key=lambda n: n.priority)

    def get_context_for_node(
        self,
        graph: DAGGraph,
        node: DAGNode,
    ) -> dict[str, str]:
        """
        Collect outputs from all completed dependency nodes.
        Returns {agent_name: output} for context injection.
        """
        context: dict[str, str] = {}
        dep_ids = graph.get_dependencies(node.node_id)

        for dep_id in dep_ids:
            dep_node = graph.get_node(dep_id)
            if dep_node and dep_node.succeeded and dep_node.output:
                context[dep_node.agent_name] = dep_node.output

        return context

    def is_complete(self, graph: DAGGraph) -> bool:
        """Return True if all nodes have reached a terminal state."""
        return all(n.is_done for n in graph.nodes)

    def has_runnable_nodes(self, graph: DAGGraph) -> bool:
        """Return True if there is still work to do."""
        return any(
            n.status in (NodeStatus.PENDING, NodeStatus.RUNNING)
            for n in graph.nodes
        )

    def summary(self, graph: DAGGraph) -> dict:
        counts: dict[str, int] = {}
        for node in graph.nodes:
            counts[node.status.value] = counts.get(node.status.value, 0) + 1
        return counts
