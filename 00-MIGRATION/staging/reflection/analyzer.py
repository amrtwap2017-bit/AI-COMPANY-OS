"""
app/reflection/analyzer.py
────────────────────────────────────────────────────────────────
Analyzes a single execution and produces a ReflectionResult.

Rule-based. No LLM calls. Fast and deterministic.

Quality scoring uses multiple signals:
  - Output length (content richness)
  - Structured output detection (headers, lists, code blocks)
  - Failure indicators (error keywords)
  - Completeness signals (conclusion, summary keywords)
"""

from __future__ import annotations

import re
from app.reflection.models import ExecutionRecord, ReflectionResult

# Speed thresholds (seconds)
FAST_THRESHOLD   = 10.0
SLOW_THRESHOLD   = 120.0

# Output length bands
EMPTY_LENGTH     = 0
MINIMAL_LENGTH   = 50
SHORT_LENGTH     = 150
MEDIUM_LENGTH    = 400
LONG_LENGTH      = 800

# Structure signals — markdown indicators of rich output
STRUCTURE_PATTERNS = [
    r"^#{1,3}\s",          # headers
    r"^\*\*[A-Z]",         # bold headers
    r"^\d+\.\s",           # numbered lists
    r"^[-•]\s",            # bullet points
    r"```",                # code blocks
    r"\|\s.+\s\|",         # tables
]

# Failure keywords in output
FAILURE_KEYWORDS = [
    "error", "failed", "cannot", "unable to",
    "i don't know", "i cannot", "not found",
    "sorry", "unfortunately",
]

# Completeness keywords
COMPLETION_KEYWORDS = [
    "conclusion", "summary", "in summary",
    "therefore", "recommendation", "findings",
    "result", "output", "answer",
]


class ReflectionAnalyzer:

    def analyze(self, execution: ExecutionRecord) -> ReflectionResult:
        success = execution.status == "success"
        quality = self._score_quality(execution)
        speed   = self._rate_speed(execution.duration_seconds)
        lessons = self._extract_lessons(execution, success, quality, speed)
        improvements = self._suggest_improvements(
            execution, success, quality, speed
        )
        failure_reason = (
            self._identify_failure(execution) if not success else None
        )

        return ReflectionResult(
            execution=execution,
            success=success,
            quality_score=quality,
            speed_rating=speed,
            lessons=lessons,
            improvements=improvements,
            failure_reason=failure_reason,
            should_remember=len(lessons) > 0 or not success,
        )

    def _score_quality(self, ex: ExecutionRecord) -> float:
        """
        Multi-signal quality score 0.0–1.0.

        Signals:
          - Status (failed = max 0.2)
          - Output length (0.0–0.4)
          - Structural richness (0.0–0.2)
          - Failure keywords in output (penalty)
          - Completion keywords in output (bonus)
        """
        if ex.status != "success":
            return 0.1

        output = ex.output or ""
        length = len(output)

        if length == EMPTY_LENGTH:
            return 0.0
        if length < MINIMAL_LENGTH:
            return 0.2
        if length < SHORT_LENGTH:
            base = 0.35
        elif length < MEDIUM_LENGTH:
            base = 0.50
        elif length < LONG_LENGTH:
            base = 0.65
        else:
            base = 0.75

        # Structure bonus (up to +0.15)
        structure_score = self._structure_score(output)
        base += structure_score * 0.15

        # Failure keyword penalty (up to -0.2)
        output_lower = output.lower()
        failure_count = sum(
            1 for kw in FAILURE_KEYWORDS if kw in output_lower
        )
        base -= min(failure_count * 0.05, 0.2)

        # Completion keyword bonus (up to +0.10)
        completion_count = sum(
            1 for kw in COMPLETION_KEYWORDS if kw in output_lower
        )
        base += min(completion_count * 0.02, 0.10)

        return round(min(max(base, 0.0), 1.0), 3)

    def _structure_score(self, output: str) -> float:
        """
        0.0–1.0 based on how many structural patterns appear.
        """
        lines = output.split("\n")
        matches = 0
        pattern_objects = [re.compile(p, re.MULTILINE) for p in STRUCTURE_PATTERNS]

        for pattern in pattern_objects:
            if pattern.search(output):
                matches += 1

        return min(matches / len(STRUCTURE_PATTERNS), 1.0)

    def _rate_speed(self, duration: float) -> str:
        if duration < FAST_THRESHOLD:
            return "fast"
        if duration > SLOW_THRESHOLD:
            return "slow"
        return "normal"

    def _extract_lessons(
        self,
        ex: ExecutionRecord,
        success: bool,
        quality: float,
        speed: str,
    ) -> list[str]:
        lessons: list[str] = []

        if not success:
            lessons.append(
                f"Agent {ex.agent_name} failed on task: "
                f"{ex.task[:100]}. "
                f"Error: {ex.error or 'unknown'}"
            )

        if speed == "slow":
            lessons.append(
                f"Agent {ex.agent_name} was slow "
                f"({ex.duration_seconds:.1f}s). "
                f"Consider a smaller model or simpler prompt."
            )

        if success and quality < 0.4:
            lessons.append(
                f"Agent {ex.agent_name} produced low-quality output "
                f"(score={quality}). "
                f"Output lacked structure or depth. "
                f"Review prompt template."
            )
        elif success and quality < 0.6:
            lessons.append(
                f"Agent {ex.agent_name} output was acceptable but "
                f"could be more structured (score={quality})."
            )

        return lessons

    def _suggest_improvements(
        self,
        ex: ExecutionRecord,
        success: bool,
        quality: float,
        speed: str,
    ) -> list[str]:
        improvements: list[str] = []

        if not success:
            improvements.append("Add retry logic for this task type")
            improvements.append(
                "Check if a different model handles this better"
            )

        if speed == "slow":
            improvements.append(
                f"Try a smaller model for {ex.agent_name}"
            )

        if quality < 0.4 and success:
            improvements.append(
                "Improve system prompt to enforce structured output"
            )
            improvements.append(
                "Add explicit output format requirements to prompt"
            )
        elif quality < 0.6 and success:
            improvements.append(
                "Add markdown formatting requirements to prompt"
            )

        return improvements

    def _identify_failure(self, ex: ExecutionRecord) -> str | None:
        if ex.error:
            return ex.error[:500]
        if ex.status == "timeout":
            return f"Timed out after {ex.duration_seconds:.1f}s"
        if ex.status == "failed":
            return "Execution failed — no error message captured"
        return None
