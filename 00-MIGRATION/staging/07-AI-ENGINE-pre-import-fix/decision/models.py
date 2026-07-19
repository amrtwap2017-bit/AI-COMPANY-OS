"""
app/decision/models.py
────────────────────────────────────────────────────────────────
Data shapes for the Decision Engine.
No database logic. No business logic. Pure data.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class DecisionVerdict(str, Enum):
    ACCEPT   = "accept"    # confidence >= 0.7, low risk
    REVIEW   = "review"    # confidence 0.4-0.7, medium risk
    RETRY    = "retry"     # confidence < 0.4, output too poor
    ESCALATE = "escalate"  # critical risk detected


class RiskLevel(str, Enum):
    LOW      = "low"
    MEDIUM   = "medium"
    HIGH     = "high"
    CRITICAL = "critical"


@dataclass
class RiskFlag:
    """A single identified risk in the agent output."""
    category:    str       # hallucination | incomplete | off_topic | harmful
    description: str
    severity:    RiskLevel
    evidence:    str       # the part of output that triggered this flag


@dataclass
class Alternative:
    """A suggested alternative approach."""
    approach:    str
    rationale:   str
    agents:      list[str]  # which agents would implement this


@dataclass
class DecisionInput:
    """Everything needed to make a decision about an output."""
    agent_name:   str
    task:         str
    output:       str
    model_used:   str
    duration_s:   float
    context_used: bool = False


@dataclass
class DecisionResult:
    """
    Complete result of running the Decision Engine
    on a single agent output.
    """
    input:           DecisionInput
    confidence:      float          # 0.0–1.0
    verdict:         DecisionVerdict
    risk_level:      RiskLevel
    risk_flags:      list[RiskFlag]  = field(default_factory=list)
    alternatives:    list[Alternative] = field(default_factory=list)
    reasoning:       str            = ""
    should_retry:    bool           = False
    should_escalate: bool           = False

    @property
    def is_accepted(self) -> bool:
        return self.verdict == DecisionVerdict.ACCEPT

    @property
    def highest_risk(self) -> RiskLevel:
        if not self.risk_flags:
            return RiskLevel.LOW
        order = {
            RiskLevel.CRITICAL: 3,
            RiskLevel.HIGH:     2,
            RiskLevel.MEDIUM:   1,
            RiskLevel.LOW:      0,
        }
        return max(
            self.risk_flags,
            key=lambda r: order[r.severity],
        ).severity
