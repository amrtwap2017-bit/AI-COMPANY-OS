"""
app/reflection/models.py
────────────────────────────────────────────────────────────────
Data classes for the reflection pipeline.
No database logic. No business logic. Pure data shapes.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class ExecutionRecord:
    """Input to the reflection engine — what just happened."""
    agent_name:       str
    task:             str
    output:           str
    model_used:       str
    status:           str             # success | failed | timeout
    duration_seconds: float
    error:            str | None = None
    conversation_id:  int | None = None
    project_id:       int | None = None


@dataclass
class ReflectionResult:
    """Output of the reflection engine — analysis of what happened."""
    execution:        ExecutionRecord
    success:          bool
    quality_score:    float           # 0.0–1.0
    speed_rating:     str             # fast | normal | slow
    lessons:          list[str]       = field(default_factory=list)
    improvements:     list[str]       = field(default_factory=list)
    failure_reason:   str | None      = None
    should_remember:  bool            = True
    created_at:       datetime        = field(default_factory=datetime.utcnow)
