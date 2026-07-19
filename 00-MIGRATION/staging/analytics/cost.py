"""
app/analytics/cost.py
────────────────────────────────────────────────────────────────
Cost tracking for local LLM inference.

Since all models run locally, "cost" is measured in:
  - Time (seconds) — real cost for local hardware
  - Estimated tokens — proxy for computational work

Token estimation: 4 characters ≈ 1 token (rough average)

This gives actionable data:
  - Which agents are most expensive (time-wise)?
  - Which prompts are bloated?
  - What is the total compute load?

GET /analytics/costs  returns per-agent, per-model cost breakdown.
"""

from __future__ import annotations

import logging
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.db.analytics import PlatformEvent

log = logging.getLogger(__name__)

CHARS_PER_TOKEN = 4   # rough estimate


def estimate_tokens(char_count: int | None) -> int:
    if not char_count:
        return 0
    return max(1, char_count // CHARS_PER_TOKEN)


class CostEngine:

    def __init__(self, db: Session) -> None:
        self._db = db

    def agent_costs(self) -> list[dict]:
        """Per-agent cost breakdown: total time + estimated tokens."""
        rows = (
            self._db.query(
                PlatformEvent.agent_name,
                PlatformEvent.model_used,
                func.count(PlatformEvent.id).label("calls"),
                func.sum(PlatformEvent.duration_seconds).label("total_seconds"),
                func.avg(PlatformEvent.duration_seconds).label("avg_seconds"),
                func.sum(PlatformEvent.input_chars).label("total_input_chars"),
                func.sum(PlatformEvent.output_chars).label("total_output_chars"),
            )
            .filter(
                PlatformEvent.event_type == "agent_call",
                PlatformEvent.agent_name.isnot(None),
            )
            .group_by(PlatformEvent.agent_name, PlatformEvent.model_used)
            .order_by(func.sum(PlatformEvent.duration_seconds).desc())
            .all()
        )

        results = []
        for r in rows:
            input_tokens  = estimate_tokens(r.total_input_chars)
            output_tokens = estimate_tokens(r.total_output_chars)
            results.append({
                "agent":             r.agent_name,
                "model":             r.model_used,
                "total_calls":       r.calls,
                "total_seconds":     round(float(r.total_seconds or 0), 1),
                "avg_seconds":       round(float(r.avg_seconds or 0), 1),
                "est_input_tokens":  input_tokens,
                "est_output_tokens": output_tokens,
                "est_total_tokens":  input_tokens + output_tokens,
            })

        return results

    def model_costs(self) -> list[dict]:
        """Per-model cost summary."""
        rows = (
            self._db.query(
                PlatformEvent.model_used,
                func.count(PlatformEvent.id).label("calls"),
                func.sum(PlatformEvent.duration_seconds).label("total_seconds"),
                func.avg(PlatformEvent.duration_seconds).label("avg_seconds"),
                func.sum(PlatformEvent.input_chars).label("input_chars"),
                func.sum(PlatformEvent.output_chars).label("output_chars"),
            )
            .filter(PlatformEvent.model_used.isnot(None))
            .group_by(PlatformEvent.model_used)
            .order_by(func.sum(PlatformEvent.duration_seconds).desc())
            .all()
        )

        return [
            {
                "model":             r.model_used,
                "total_calls":       r.calls,
                "total_seconds":     round(float(r.total_seconds or 0), 1),
                "avg_seconds":       round(float(r.avg_seconds or 0), 1),
                "est_total_tokens":  (
                    estimate_tokens(r.input_chars) +
                    estimate_tokens(r.output_chars)
                ),
            }
            for r in rows
        ]

    def summary(self) -> dict:
        """Platform-wide cost summary."""
        row = (
            self._db.query(
                func.count(PlatformEvent.id).label("total_calls"),
                func.sum(PlatformEvent.duration_seconds).label("total_seconds"),
                func.sum(PlatformEvent.input_chars).label("input_chars"),
                func.sum(PlatformEvent.output_chars).label("output_chars"),
            )
            .filter(PlatformEvent.event_type == "agent_call")
            .one()
        )

        total_s = float(row.total_seconds or 0)
        return {
            "total_agent_calls":   row.total_calls or 0,
            "total_compute_hours": round(total_s / 3600, 3),
            "total_compute_minutes": round(total_s / 60, 1),
            "est_total_tokens":    (
                estimate_tokens(row.input_chars) +
                estimate_tokens(row.output_chars)
            ),
            "avg_seconds_per_call": round(
                total_s / max(row.total_calls or 1, 1), 1
            ),
        }
