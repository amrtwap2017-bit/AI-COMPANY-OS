"""
app/learning/models.py
────────────────────────────────────────────────────────────────
Data shapes for the Learning Engine.
No database logic. Pure data.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class InsightType(str, Enum):
    MODEL_PERFORMANCE   = "model_performance"
    PROMPT_QUALITY      = "prompt_quality"
    AGENT_PATTERN       = "agent_pattern"
    FAILURE_PATTERN     = "failure_pattern"
    SPEED_PATTERN       = "speed_pattern"
    IMPROVEMENT         = "improvement"


@dataclass
class ModelRanking:
    """Performance ranking for a model on a specific agent."""
    agent_name:       str
    model:            str
    avg_quality:      float    # 0.0–1.0 from reflections
    avg_duration:     float    # seconds
    success_rate:     float    # 0.0–1.0
    sample_count:     int
    recommendation:   str      # use | avoid | prefer_for_simple


@dataclass
class PromptScore:
    """Quality score for an agent's prompt template."""
    agent_name:       str
    avg_output_quality: float
    avg_confidence:   float
    rejection_rate:   float    # how often decision engine rejects
    improvement_hint: str      # what to add to the prompt


@dataclass
class LearningInsight:
    """A single actionable insight derived from platform data."""
    insight_type:   InsightType
    agent_name:     str | None
    model:          str | None
    title:          str
    description:    str
    recommendation: str
    evidence:       dict        # supporting data
    confidence:     float       # 0.0–1.0 confidence in this insight
    priority:       int         # 1 (urgent) to 5 (informational)


@dataclass
class LearningReport:
    """Full learning report from one engine run."""
    model_rankings:  list[ModelRanking]  = field(default_factory=list)
    prompt_scores:   list[PromptScore]   = field(default_factory=list)
    insights:        list[LearningInsight] = field(default_factory=list)
    total_analyzed:  int = 0
    summary:         str = ""
