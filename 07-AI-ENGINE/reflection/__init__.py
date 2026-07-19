"""
Reflection Engine — public API.

Usage:
    from reflection.engine import ReflectionEngine
    from reflection.models import ExecutionRecord

    engine = ReflectionEngine(db)
    result = engine.reflect(ExecutionRecord(...))
"""

from reflection.engine import ReflectionEngine
from reflection.models import ExecutionRecord, ReflectionResult

__all__ = ["ReflectionEngine", "ExecutionRecord", "ReflectionResult"]
