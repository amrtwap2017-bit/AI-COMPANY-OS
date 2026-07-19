"""
Execution DAG — public API.

Usage:
    from app.dag.engine import DAGEngine

    engine = DAGEngine(db)
    result = engine.run(
        goal="Research AI and write a report",
        pattern="research_and_write",
    )
    print(result.status)
    print(result.succeeded_count, "nodes succeeded")
"""

from app.dag.engine import DAGEngine
from app.dag.models import DAGExecution, DAGStatus, NodeStatus

__all__ = ["DAGEngine", "DAGExecution", "DAGStatus", "NodeStatus"]
