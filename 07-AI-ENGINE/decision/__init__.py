"""
Decision Engine — public API.

Usage:
    from decision.engine import DecisionEngine
    from decision.models import DecisionInput, DecisionVerdict

    engine = DecisionEngine(db)
    result = engine.evaluate(DecisionInput(
        agent_name="researcher",
        task="Research AI trends",
        output=response_text,
        model_used="qwen3.5:4b",
        duration_s=87.3,
    ))

    if result.verdict == DecisionVerdict.ACCEPT:
        return result.input.output
    elif result.verdict == DecisionVerdict.RETRY:
        # re-run with better prompt
"""

from decision.engine import DecisionEngine
from decision.models import (
    DecisionInput,
    DecisionResult,
    DecisionVerdict,
    RiskLevel,
)

__all__ = [
    "DecisionEngine",
    "DecisionInput",
    "DecisionResult",
    "DecisionVerdict",
    "RiskLevel",
]
