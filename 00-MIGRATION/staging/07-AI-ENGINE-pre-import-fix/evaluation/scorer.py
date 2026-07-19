"""
app/evaluation/scorer.py
────────────────────────────────────────────────────────────────
Rule-based benchmark scorer — no LLM calls.

Signals:
  1. Output length vs minimum required
  2. Required keywords present
  3. Anti-keywords absent
  4. Structural richness (headers, lists, etc.)
  5. Failure admission phrases

Returns a score 0.0–1.0.
Also computes composite when LLM score is available.
"""

from __future__ import annotations

import re
from app.evaluation.benchmarks import Benchmark

# Structural richness patterns
STRUCTURE_PATTERNS = [
    re.compile(r"^#{1,3}\s", re.MULTILINE),
    re.compile(r"^\*\*[A-Z]", re.MULTILINE),
    re.compile(r"^\d+\.\s", re.MULTILINE),
    re.compile(r"^[-•]\s", re.MULTILINE),
]

FAILURE_PHRASES = [
    "i cannot", "i can't", "i don't know",
    "i'm not sure", "as an ai", "i am an ai",
    "sorry, i", "unfortunately i",
]


class BenchmarkScorer:

    def score_rule_based(
        self,
        output:     str,
        benchmark:  Benchmark,
    ) -> float:
        """
        Score output against benchmark rules.
        Returns 0.0–1.0.
        """
        if not output or not output.strip():
            return 0.0

        output_lower = output.lower()
        score = 0.0

        # 1. Length (25%)
        length = len(output)
        if length >= benchmark.min_length * 2:
            length_score = 1.0
        elif length >= benchmark.min_length:
            length_score = 0.7
        elif length >= benchmark.min_length * 0.5:
            length_score = 0.4
        else:
            length_score = 0.1
        score += length_score * 0.25

        # 2. Required keywords (35%)
        if benchmark.keywords:
            matched = sum(
                1 for kw in benchmark.keywords
                if kw.lower() in output_lower
            )
            keyword_score = matched / len(benchmark.keywords)
        else:
            keyword_score = 1.0
        score += keyword_score * 0.35

        # 3. Anti-keywords absent (20%)
        has_anti = any(
            ak.lower() in output_lower
            for ak in benchmark.anti_keywords
        )
        has_failure = any(p in output_lower for p in FAILURE_PHRASES)
        anti_score = 0.0 if (has_anti or has_failure) else 1.0
        score += anti_score * 0.20

        # 4. Structure (20%)
        structure_count = sum(
            1 for p in STRUCTURE_PATTERNS if p.search(output)
        )
        structure_score = min(structure_count / len(STRUCTURE_PATTERNS), 1.0)
        score += structure_score * 0.20

        return round(min(max(score, 0.0), 1.0), 3)

    def compute_composite(
        self,
        rule_score: float,
        llm_score:  float | None = None,
    ) -> float:
        """
        Combine rule-based and LLM scores.
        If no LLM score: use rule_score only.
        If LLM score available: 40% rule + 60% LLM (normalised to 0-1).
        """
        if llm_score is None:
            return rule_score

        # Normalise LLM score from 0-10 to 0-1
        llm_normalised = max(0.0, min(llm_score / 10.0, 1.0))
        return round(rule_score * 0.4 + llm_normalised * 0.6, 3)

    def detect_regression(
        self,
        current_score: float,
        baseline_score: float | None,
        threshold: float = 0.10,
    ) -> bool:
        """
        Returns True if current score is threshold below baseline.
        Default threshold: 0.10 (10 percentage points drop).
        """
        if baseline_score is None:
            return False
        return current_score < (baseline_score - threshold)


benchmark_scorer = BenchmarkScorer()
