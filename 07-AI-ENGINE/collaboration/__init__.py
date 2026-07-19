"""
Multi-Agent Collaboration Engine.

Usage:
    from collaboration.engine import CollaborationEngine

    engine = CollaborationEngine(db)
    result = engine.run(
        goal="Research AI trends and write a report",
        strategy="research_and_write",
    )
    print(result.final_response)
    print(f"Agents used: {[o.agent_name for o in result.outputs]}")
"""

from collaboration.engine import CollaborationEngine
from collaboration.models import CollaborationResult, CollabStatus

__all__ = ["CollaborationEngine", "CollaborationResult", "CollabStatus"]
