"""
app/models/db/benchmark.py
────────────────────────────────────────────────────────────────
Stores benchmark run results for every agent.

A benchmark run:
  1. Takes a standard test prompt for an agent
  2. Runs the agent (calls Ollama)
  3. Scores the output (rule-based + optional LLM)
  4. Stores the result here

This table is the foundation for:
  - Regression detection (score dropped from baseline?)
  - Historical quality trends per agent
  - Side-by-side prompt comparison
  - Golden set validation
"""

from __future__ import annotations

from sqlalchemy import String, Text, Float, Integer, JSON, Index, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base, TimestampMixin


class BenchmarkRun(Base, TimestampMixin):
    __tablename__ = "benchmark_runs"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )

    # What was tested
    agent_name:    Mapped[str] = mapped_column(String(100), nullable=False)
    benchmark_id:  Mapped[str] = mapped_column(String(100), nullable=False)
    # e.g. "researcher_basic", "writer_report", "analyst_data"
    prompt:        Mapped[str] = mapped_column(Text, nullable=False)
    model_used:    Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Output
    output:        Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_s:    Mapped[float | None] = mapped_column(Float, nullable=True)

    # Scores (0.0 - 1.0 for rule-based, 0.0 - 10.0 for LLM)
    rule_score:    Mapped[float | None] = mapped_column(Float, nullable=True)
    llm_score:     Mapped[float | None] = mapped_column(Float, nullable=True)
    # Normalised 0-1 composite
    composite_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Regression flag
    is_regression: Mapped[bool] = mapped_column(Boolean, default=False)
    # True if composite_score < (baseline - threshold)
    baseline_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    # What the baseline was at time of this run

    # LLM evaluator feedback
    llm_feedback:   Mapped[str | None] = mapped_column(Text, nullable=True)
    llm_strengths:  Mapped[list | None] = mapped_column(JSON, nullable=True)
    llm_weaknesses: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # Run metadata
    run_group: Mapped[str | None] = mapped_column(String(100), nullable=True)
    # Groups runs together: "nightly_2026_07_05", "manual_test"
    triggered_by: Mapped[str] = mapped_column(String(50), default="manual")
    # manual | scheduler | api | ci

    __table_args__ = (
        Index("ix_benchmark_runs_agent",      "agent_name"),
        Index("ix_benchmark_runs_id",         "benchmark_id"),
        Index("ix_benchmark_runs_created_at", "created_at"),
        Index("ix_benchmark_runs_regression", "is_regression"),
    )

    def __repr__(self) -> str:
        return (
            f"<BenchmarkRun id={self.id} "
            f"agent={self.agent_name!r} "
            f"score={self.composite_score}>"
        )
