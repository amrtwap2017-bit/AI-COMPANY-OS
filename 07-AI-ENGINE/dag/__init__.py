"""
Execution DAG — public API.

Usage:
    from dag.engine import DAGEngine

    engine = DAGEngine(db)
    result = engine.run(
        goal="Research AI and write a report",
        pattern="research_and_write",
    )
    print(result.status)
    print(result.succeeded_count, "nodes succeeded")
"""

from dag.engine import DAGEngine
from dag.models import DAGExecution, DAGStatus, NodeStatus

__all__ = ["DAGEngine", "DAGExecution", "DAGStatus", "NodeStatus"]
