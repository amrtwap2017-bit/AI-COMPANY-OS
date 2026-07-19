"""
Reflection Engine — public API.

Usage:
    from app.reflection.engine import ReflectionEngine
    from app.reflection.models import ExecutionRecord

    engine = ReflectionEngine(db)
    result = engine.reflect(ExecutionRecord(...))
"""

from app.reflection.engine import ReflectionEngine
from app.reflection.models import ExecutionRecord, ReflectionResult

__all__ = ["ReflectionEngine", "ExecutionRecord", "ReflectionResult"]
