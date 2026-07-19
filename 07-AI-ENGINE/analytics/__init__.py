"""
Analytics package.

Exposes the public surface for the rest of the codebase:
  - track_*() functions from tracker
  - AnalyticsEngine from engine

The background writer is started by the application lifespan,
not imported directly by callers.
"""

from analytics.tracker import (
    track,
    track_agent_call,
    track_workflow,
    track_chat,
    track_tool,
    track_knowledge_search,
    track_project,
)
from analytics.engine import AnalyticsEngine

__all__ = [
    "track",
    "track_agent_call",
    "track_workflow",
    "track_chat",
    "track_tool",
    "track_knowledge_search",
    "track_project",
    "AnalyticsEngine",
]