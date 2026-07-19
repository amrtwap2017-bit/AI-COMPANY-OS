"""
app/decision/scorer.py
────────────────────────────────────────────────────────────────
Scores agent output confidence from 0.0 to 1.0.

Signals used (weighted):
  Output length          25%  — empty outputs = zero confidence
  Task alignment         30%  — does the output address the task?
  Structural richness    20%  — headers, lists, code = more confident
  Completion signals     15%  — conclusion, summary, answer present
  Failure indicators     10%  — penalise "I don't know" type outputs

No LLM calls. Pure text analysis. Fast and deterministic.
"""

from __future__ import annotations

import re

from app.decision.models import DecisionInput

# Task alignment — keywords that should appear in output
# when their trigger word is in the task
TASK_ALIGNMENT_PAIRS: list[tuple[str, list[str]]] = [
    ("research",  ["found", "analys", "accord", "evidence", "studi",
                   "investigat", "discover", "show", "applic"]),
    ("write",     ["overview", "introduc", "conclusion", "section",
                   "summar", "report", "document"]),
    ("analyze",   ["pattern", "trend", "insight", "data", "result",
                   "metric", "statistic", "finding"]),
    ("build",     ["function", "class", "method", "return", "import",
                   "implement", "create", "develop"]),
    ("plan",      ["step", "phase", "task", "milestone", "timeline",
                   "roadmap", "sprint", "priorit"]),
    ("review",    ["issue", "improve", "suggest", "recommend",
                   "problem", "fix", "refactor"]),
    ("design",    ["component", "architect", "system", "interface",
                   "module", "pattern", "structur"]),
    ("explain",   ["because", "therefore", "means", "example",
                   "concept", "work", "defin"]),
]

# Structure markers
STRUCTURE_RE = [
    re.compile(r"^#{1,3}\s",       re.MULTILINE),
    re.compile(r"^\*\*[A-Z]",      re.MULTILINE),
    re.compile(r"^\d+\.\s",        re.MULTILINE),
    re.compile(r"^[-•]\s",         re.MULTILINE),
    re.compile(r"```",             re.MULTILINE),
]

# Completion signals
COMPLETION_KW = [
    "in conclusion", "in summary", "to summarize",
    "therefore", "recommendation", "the answer",
    "in total", "overall", "final",
]

# Failure signals — output admits it cannot help
FAILURE_KW = [
    "i don't know", "i cannot", "i'm not sure",
    "i'm unable to", "sorry, i", "unfortunately i",
    "i do not have", "as an ai", "i am an ai",
    "i can't provide", "not able to",
]


class ConfidenceScorer:

    def score(self, inp: DecisionInput) -> float:
        """Return confidence 0.0–1.0."""
        output = inp.output or ""

        length_score      = self._length_score(output)
        alignment_score   = self._alignment_score(inp.task, output)
        structure_score   = self._structure_score(output)
        completion_score  = self._completion_score(output)
        failure_penalty   = self._failure_penalty(output)

        raw = (
            length_score    * 0.25 +
            alignment_score * 0.30 +
            structure_score * 0.20 +
            completion_score * 0.15 +
            (1.0 - failure_penalty) * 0.10
        )

        return round(min(max(raw, 0.0), 1.0), 3)

    def _length_score(self, output: str) -> float:
        length = len(output)
        if length == 0:     return 0.0
        if length < 50:     return 0.1
        if length < 150:    return 0.3
        if length < 400:    return 0.6
        if length < 800:    return 0.8
        return 1.0

    def _alignment_score(self, task: str, output: str) -> float:
        """
        Check if output addresses what the task asked for.
        """
        task_lower   = task.lower()
        output_lower = output.lower()

        matched_pairs = 0
        checked_pairs = 0

        for trigger, signals in TASK_ALIGNMENT_PAIRS:
            if trigger in task_lower:
                checked_pairs += 1
                if any(s in output_lower for s in signals):
                    matched_pairs += 1

        if checked_pairs == 0:
            # No specific alignment check possible — neutral score
            return 0.6

        return matched_pairs / checked_pairs

    def _structure_score(self, output: str) -> float:
        matches = sum(
            1 for pattern in STRUCTURE_RE
            if pattern.search(output)
        )
        return min(matches / len(STRUCTURE_RE), 1.0)

    def _completion_score(self, output: str) -> float:
        output_lower = output.lower()
        matches = sum(1 for kw in COMPLETION_KW if kw in output_lower)
        return min(matches / 3, 1.0)

    def _failure_penalty(self, output: str) -> float:
        output_lower = output.lower()
        hits = sum(1 for kw in FAILURE_KW if kw in output_lower)
        return min(hits * 0.4, 1.0)
