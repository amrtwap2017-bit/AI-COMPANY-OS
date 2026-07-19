"""
app/dag/builder.py
────────────────────────────────────────────────────────────────
Builds DAGGraph objects from various inputs.

Supports:
  1. From agent list     → sequential or parallel based on deps
  2. From strategy name  → predefined pipeline patterns
  3. From explicit spec  → caller provides nodes + edges directly

Also validates graphs for cycles before returning.
"""

from __future__ import annotations

import logging
from dag.models import DAGGraph, DAGNode, DAGEdge

log = logging.getLogger(__name__)

# Predefined pipeline patterns
# Each pattern is a list of groups.
# Agents within the same group run in parallel.
# Each group depends on ALL agents in the previous group.
PIPELINE_PATTERNS: dict[str, list[list[str]]] = {
    "research_and_write": [
        ["researcher"],
        ["writer"],
        ["evaluator"],
    ],
    "parallel_research": [
        ["researcher", "analyst"],
        ["writer"],
        ["evaluator"],
    ],
    "plan_and_build": [
        ["planner"],
        ["architect"],
        ["backend", "frontend"],
        ["tester"],
    ],
    "full_pipeline": [
        ["researcher", "planner"],
        ["writer"],
        ["evaluator"],
    ],
    "review_and_fix": [
        ["reviewer", "tester"],
        ["backend"],
    ],
    "deep_research": [
        ["researcher", "analyst", "knowledge_manager"],
        ["writer"],
        ["evaluator"],
    ],
}


class DAGBuilder:

    def from_pattern(
        self,
        goal: str,
        pattern: str,
        timeout_s: int = 300,
        max_retries: int = 1,
    ) -> DAGGraph:
        """
        Build a DAGGraph from a named pipeline pattern.
        """
        groups = PIPELINE_PATTERNS.get(pattern)
        if not groups:
            log.warning("Unknown pattern %r — using research_and_write", pattern)
            groups = PIPELINE_PATTERNS["research_and_write"]

        return self.from_groups(
            goal=goal,
            groups=groups,
            timeout_s=timeout_s,
            max_retries=max_retries,
        )

    def from_groups(
        self,
        goal: str,
        groups: list[list[str]],
        timeout_s: int = 300,
        max_retries: int = 1,
    ) -> DAGGraph:
        """
        Build a DAGGraph from a list of agent groups.
        Agents in the same group run in parallel.
        Each group depends on all agents in the previous group.
        """
        graph = DAGGraph(goal=goal)
        prev_group_ids: list[str] = []

        for group_idx, group in enumerate(groups):
            current_ids: list[str] = []

            for agent_name in group:
                node_id = f"{agent_name}_{group_idx}"
                priority = group_idx + 1

                node = DAGNode(
                    node_id=node_id,
                    agent_name=agent_name,
                    task=goal,
                    priority=priority,
                    timeout_s=timeout_s,
                    max_retries=max_retries,
                )
                graph.add_node(node)
                current_ids.append(node_id)

                # Every node in this group depends on every node
                # in the previous group
                for prev_id in prev_group_ids:
                    graph.add_edge(prev_id, node_id)

            prev_group_ids = current_ids

        self._validate(graph)
        return graph

    def from_agent_list(
        self,
        goal: str,
        agents: list[str],
        sequential: bool = True,
        timeout_s: int = 300,
        max_retries: int = 1,
    ) -> DAGGraph:
        """
        Build a DAGGraph from a flat list of agents.
        sequential=True  → A → B → C (chain)
        sequential=False → A, B, C all parallel
        """
        if sequential:
            groups = [[a] for a in agents]
        else:
            groups = [agents]

        return self.from_groups(
            goal=goal,
            groups=groups,
            timeout_s=timeout_s,
            max_retries=max_retries,
        )

    def _validate(self, graph: DAGGraph) -> None:
        """
        Validate the graph has no cycles using DFS.
        Raises ValueError if a cycle is detected.
        """
        visited:    set[str] = set()
        rec_stack: set[str] = set()

        def dfs(node_id: str) -> bool:
            visited.add(node_id)
            rec_stack.add(node_id)
            for dep_id in graph.get_dependents(node_id):
                if dep_id not in visited:
                    if dfs(dep_id):
                        return True
                elif dep_id in rec_stack:
                    return True
            rec_stack.discard(node_id)
            return False

        for node in graph.nodes:
            if node.node_id not in visited:
                if dfs(node.node_id):
                    raise ValueError(
                        f"Cycle detected in DAG graph for goal: {graph.goal}"
                    )

    def list_patterns(self) -> list[str]:
        return list(PIPELINE_PATTERNS.keys())


builder = DAGBuilder()
