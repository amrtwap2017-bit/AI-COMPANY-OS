"""
app/evaluation/runner.py
────────────────────────────────────────────────────────────────
Executes benchmarks and stores results.

Pipeline per benchmark:
  1. Load benchmark definition
  2. Run agent via Orchestrator
  3. Score with rule-based scorer (fast, no LLM)
  4. Optionally score with LLM evaluator (slow, accurate)
  5. Detect regression vs baseline
  6. Store BenchmarkRun in DB
  7. Return BenchmarkResult

Baseline = average of last N successful runs for same benchmark_id.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from sqlalchemy import func, Integer
from sqlalchemy.orm import Session

from evaluation.benchmarks import Benchmark, get_benchmarks, get_benchmark
from evaluation.scorer import BenchmarkScorer
from models.db.benchmark import BenchmarkRun

log = logging.getLogger(__name__)

REGRESSION_THRESHOLD    = 0.10   # 10% drop triggers regression flag
BASELINE_WINDOW         = 5      # use last 5 successful runs as baseline
USE_LLM_SCORING_DEFAULT = False  # LLM scoring is opt-in (slow)


@dataclass
class BenchmarkResult:
    benchmark_id:   str
    agent_name:     str
    rule_score:     float
    llm_score:      float | None
    composite_score: float
    is_regression:  bool
    baseline_score: float | None
    duration_s:     float
    output_preview: str
    feedback:       str
    run_id:         int


@dataclass
class BenchmarkSuiteResult:
    total:        int
    passed:       int
    regressions:  int
    avg_score:    float
    results:      list[BenchmarkResult] = field(default_factory=list)
    run_group:    str = ""


class BenchmarkRunner:

    def __init__(self, db: Session) -> None:
        self._db      = db
        self._scorer  = BenchmarkScorer()

    def run_one(
        self,
        benchmark_id: str,
        use_llm:      bool    = USE_LLM_SCORING_DEFAULT,
        run_group:    str     = "manual",
        triggered_by: str     = "manual",
    ) -> BenchmarkResult | None:
        """Run a single benchmark by ID."""
        benchmark = get_benchmark(benchmark_id)
        if not benchmark:
            log.error("Benchmark %r not found", benchmark_id)
            return None
        return self._execute(benchmark, use_llm, run_group, triggered_by)

    def run_agent(
        self,
        agent_name:   str,
        use_llm:      bool = USE_LLM_SCORING_DEFAULT,
        run_group:    str  = "manual",
        triggered_by: str  = "manual",
    ) -> BenchmarkSuiteResult:
        """Run all benchmarks for a specific agent."""
        benchmarks = get_benchmarks(agent_name)
        return self._run_suite(benchmarks, use_llm, run_group, triggered_by)

    def run_all(
        self,
        use_llm:      bool = USE_LLM_SCORING_DEFAULT,
        run_group:    str  = "",
        triggered_by: str  = "manual",
    ) -> BenchmarkSuiteResult:
        """Run the complete benchmark suite for all agents."""
        benchmarks = get_benchmarks()
        if not run_group:
            run_group = f"suite_{int(time.time())}"
        return self._run_suite(benchmarks, use_llm, run_group, triggered_by)

    def get_history(
        self,
        benchmark_id: str,
        limit:        int = 20,
    ) -> list[BenchmarkRun]:
        """Get historical runs for a benchmark."""
        return (
            self._db.query(BenchmarkRun)
            .filter(BenchmarkRun.benchmark_id == benchmark_id)
            .order_by(BenchmarkRun.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_agent_summary(self, agent_name: str) -> dict:
        """Summary statistics for an agent across all its benchmarks."""
        rows = (
            self._db.query(
                BenchmarkRun.benchmark_id,
                func.avg(BenchmarkRun.composite_score).label("avg_score"),
                func.count(BenchmarkRun.id).label("total"),
                func.sum(
                    func.cast(BenchmarkRun.is_regression, Integer)
                ).label("regressions"),
            )
            .filter(BenchmarkRun.agent_name == agent_name)
            .group_by(BenchmarkRun.benchmark_id)
            .all()
        )

        latest_scores = []
        for row in rows:
            latest = (
                self._db.query(BenchmarkRun)
                .filter(
                    BenchmarkRun.agent_name == agent_name,
                    BenchmarkRun.benchmark_id == row.benchmark_id,
                )
                .order_by(BenchmarkRun.created_at.desc())
                .first()
            )
            if latest and latest.composite_score is not None:
                latest_scores.append(latest.composite_score)

        return {
            "agent":         agent_name,
            "benchmarks":    len(rows),
            "avg_score":     round(sum(latest_scores) / len(latest_scores), 3) if latest_scores else None,
            "latest_scores": latest_scores,
            "details": [
                {
                    "benchmark_id": row.benchmark_id,
                    "avg_score":    round(float(row.avg_score or 0), 3),
                    "total_runs":   row.total,
                }
                for row in rows
            ],
        }

    # ── Private ───────────────────────────────────────────────

    def _run_suite(
        self,
        benchmarks:   list[Benchmark],
        use_llm:      bool,
        run_group:    str,
        triggered_by: str,
    ) -> BenchmarkSuiteResult:
        results: list[BenchmarkResult] = []
        regressions = 0

        for benchmark in benchmarks:
            log.info("Running benchmark: %s", benchmark.benchmark_id)
            result = self._execute(benchmark, use_llm, run_group, triggered_by)
            if result:
                results.append(result)
                if result.is_regression:
                    regressions += 1

        total    = len(results)
        passed   = sum(1 for r in results if r.composite_score >= 0.5)
        avg      = sum(r.composite_score for r in results) / max(total, 1)

        return BenchmarkSuiteResult(
            total=total,
            passed=passed,
            regressions=regressions,
            avg_score=round(avg, 3),
            results=results,
            run_group=run_group,
        )

    def _execute(
        self,
        benchmark:    Benchmark,
        use_llm:      bool,
        run_group:    str,
        triggered_by: str,
    ) -> BenchmarkResult | None:
        """Execute one benchmark and return the result."""
        start = time.time()

        # 1. Run the agent
        output, model_used = self._run_agent(
            agent_name=benchmark.agent_name,
            prompt=benchmark.prompt,
        )
        duration = time.time() - start

        if output is None:
            log.error("Agent %s failed for benchmark %s", benchmark.agent_name, benchmark.benchmark_id)
            return None

        # 2. Rule-based scoring
        rule_score = self._scorer.score_rule_based(output, benchmark)

        # 3. Optional LLM scoring
        llm_score    = None
        llm_feedback = ""
        llm_strengths:  list[str] = []
        llm_weaknesses: list[str] = []

        if use_llm and output:
            llm_result = self._llm_score(
                prompt=benchmark.prompt,
                output=output,
            )
            if llm_result:
                llm_score    = llm_result.get("score")
                llm_feedback = llm_result.get("feedback", "")
                llm_strengths  = llm_result.get("strengths", [])
                llm_weaknesses = llm_result.get("weaknesses", [])

        # 4. Composite score
        composite = self._scorer.compute_composite(rule_score, llm_score)

        # 5. Baseline + regression detection
        baseline = self._get_baseline(benchmark.benchmark_id)
        is_regression = self._scorer.detect_regression(
            composite, baseline, REGRESSION_THRESHOLD
        )

        # 6. Store in DB
        run = BenchmarkRun(
            agent_name=benchmark.agent_name,
            benchmark_id=benchmark.benchmark_id,
            prompt=benchmark.prompt,
            model_used=model_used,
            output=output[:5000] if output else None,
            duration_s=round(duration, 2),
            rule_score=rule_score,
            llm_score=llm_score,
            composite_score=composite,
            is_regression=is_regression,
            baseline_score=baseline,
            llm_feedback=llm_feedback or None,
            llm_strengths=llm_strengths or None,
            llm_weaknesses=llm_weaknesses or None,
            run_group=run_group,
            triggered_by=triggered_by,
        )
        self._db.add(run)
        self._db.commit()
        self._db.refresh(run)

        if is_regression:
            log.warning(
                "REGRESSION: %s score=%.3f baseline=%.3f",
                benchmark.benchmark_id, composite, baseline or 0,
            )

        return BenchmarkResult(
            benchmark_id=benchmark.benchmark_id,
            agent_name=benchmark.agent_name,
            rule_score=rule_score,
            llm_score=llm_score,
            composite_score=composite,
            is_regression=is_regression,
            baseline_score=baseline,
            duration_s=round(duration, 2),
            output_preview=(output or "")[:300],
            feedback=llm_feedback,
            run_id=run.id,
        )

    def _run_agent(
        self,
        agent_name: str,
        prompt:     str,
    ) -> tuple[str | None, str]:
        """Run agent via orchestrator. Returns (output, model_used)."""
        try:
            from orchestrator.manager import orchestrator
            result = orchestrator.run(
                agent_name=agent_name,
                user_input=prompt,
                use_memory=False,
                use_knowledge=False,
            )
            return (result.content if result.success else None,
                    result.model_used)
        except Exception as exc:
            log.error("Agent run failed: %s", exc)
            return None, "unknown"

    def _llm_score(self, prompt: str, output: str) -> dict | None:
        """Score using EvaluatorAgent (calls LLM)."""
        try:
            from evaluation.evaluator import evaluator_agent
            result = evaluator_agent.evaluate(task=prompt, output=output)
            return {
                "score":      result.score,
                "feedback":   result.feedback,
                "strengths":  result.strengths,
                "weaknesses": result.weaknesses,
            }
        except Exception as exc:
            log.debug("LLM scoring failed: %s", exc)
            return None

    def _get_baseline(self, benchmark_id: str) -> float | None:
        """Average of last BASELINE_WINDOW successful runs."""
        runs = (
            self._db.query(BenchmarkRun)
            .filter(
                BenchmarkRun.benchmark_id == benchmark_id,
                BenchmarkRun.composite_score.isnot(None),
            )
            .order_by(BenchmarkRun.created_at.desc())
            .limit(BASELINE_WINDOW)
            .all()
        )
        if not runs:
            return None
        scores = [r.composite_score for r in runs if r.composite_score]
        return round(sum(scores) / len(scores), 3) if scores else None
