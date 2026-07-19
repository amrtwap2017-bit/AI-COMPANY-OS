"""
app/decision/risk.py
────────────────────────────────────────────────────────────────
Analyzes agent output for risks.

Risk categories:
  hallucination  — output makes up facts it cannot know
  incomplete     — output cut off or missing key sections
  off_topic      — output does not address the task
  harmful        — output contains dangerous/inappropriate content
  overconfident  — output claims certainty it cannot have

Each flag has a severity: low | medium | high | critical
Critical flags trigger escalation regardless of confidence.
"""

from __future__ import annotations

import re

from decision.models import DecisionInput, RiskFlag, RiskLevel

# Hallucination signals — claims specific facts without basis
HALLUCINATION_PATTERNS = [
    (re.compile(r"\b(in \d{4}|as of \d{4})\b", re.I),
     "Specific year reference — may be fabricated"),
    (re.compile(r"\b(studies show|research shows|experts say)\b", re.I),
     "Vague authority claim — no source cited"),
    (re.compile(r"\b(\d+%|\d+ percent)\b", re.I),
     "Specific percentage — verify source exists"),
    (re.compile(r"\b(according to [A-Z][a-z]+ [A-Z][a-z]+)\b"),
     "Named authority without verifiable source"),
]

# Incompleteness signals
INCOMPLETE_PATTERNS = [
    (re.compile(r"\.\.\.$", re.MULTILINE),
     "Output appears to be cut off"),
    (re.compile(r"\[TODO\]|\[TBD\]|\[FILL\]", re.I),
     "Placeholder text left in output"),
    (re.compile(r"(step \d+.*\n){1}.*\n\s*$", re.DOTALL),
     "Numbered steps that may be incomplete"),
]

# Off-topic signals
OFF_TOPIC_THRESHOLD = 0.15  # minimum task keyword overlap expected

# Harmful content signals
HARMFUL_PATTERNS = [
    (re.compile(r"\b(password|secret key|api key|token)\s*[:=]\s*\S+", re.I),
     "Potential secret/credential in output", RiskLevel.CRITICAL),
    (re.compile(r"\b(rm -rf|drop table|delete from)\b", re.I),
     "Destructive command in output", RiskLevel.HIGH),
    (re.compile(r"(eval\(|exec\(|__import__)", re.I),
     "Dynamic code execution pattern", RiskLevel.HIGH),
]


class RiskAnalyzer:

    def analyze(self, inp: DecisionInput) -> list[RiskFlag]:
        """Return list of risk flags for this output."""
        flags: list[RiskFlag] = []

        flags.extend(self._check_hallucination(inp.output))
        flags.extend(self._check_incompleteness(inp.output))
        flags.extend(self._check_off_topic(inp.task, inp.output))
        flags.extend(self._check_harmful(inp.output))
        flags.extend(self._check_overconfidence(inp.output))

        return flags

    def _check_hallucination(self, output: str) -> list[RiskFlag]:
        flags: list[RiskFlag] = []
        count = 0

        for pattern, reason in HALLUCINATION_PATTERNS:
            matches = pattern.findall(output)
            if matches:
                count += len(matches)

        if count >= 3:
            flags.append(RiskFlag(
                category="hallucination",
                description=f"Output contains {count} potential fabrication signals",
                severity=RiskLevel.MEDIUM,
                evidence=f"{count} specific fact claims without citations",
            ))
        elif count >= 6:
            flags.append(RiskFlag(
                category="hallucination",
                description="High density of unverifiable fact claims",
                severity=RiskLevel.HIGH,
                evidence=f"{count} unverifiable claims detected",
            ))

        return flags

    def _check_incompleteness(self, output: str) -> list[RiskFlag]:
        flags: list[RiskFlag] = []

        for pattern, reason in INCOMPLETE_PATTERNS:
            if pattern.search(output):
                flags.append(RiskFlag(
                    category="incomplete",
                    description=reason,
                    severity=RiskLevel.MEDIUM,
                    evidence=reason,
                ))

        if len(output) < 100:
            flags.append(RiskFlag(
                category="incomplete",
                description="Output is very short for the task",
                severity=RiskLevel.LOW,
                evidence=f"Only {len(output)} characters produced",
            ))

        return flags

    def _check_off_topic(self, task: str, output: str) -> list[RiskFlag]:
        task_words = set(
            w.lower() for w in re.findall(r"\b[a-z]{4,}\b", task.lower())
        )
        output_words = set(
            w.lower() for w in re.findall(r"\b[a-z]{4,}\b", output.lower())
        )

        if not task_words:
            return []

        overlap = len(task_words & output_words) / len(task_words)

        if overlap < OFF_TOPIC_THRESHOLD:
            return [RiskFlag(
                category="off_topic",
                description="Output shares few keywords with the task",
                severity=RiskLevel.MEDIUM,
                evidence=f"Only {overlap:.0%} keyword overlap with task",
            )]

        return []

    def _check_harmful(self, output: str) -> list[RiskFlag]:
        flags: list[RiskFlag] = []

        for pattern, reason, severity in HARMFUL_PATTERNS:
            if pattern.search(output):
                flags.append(RiskFlag(
                    category="harmful",
                    description=reason,
                    severity=severity,
                    evidence=reason,
                ))

        return flags

    def _check_overconfidence(self, output: str) -> list[RiskFlag]:
        output_lower = output.lower()
        overconfidence_phrases = [
            "this is definitely", "100% certain",
            "guaranteed to work", "will always",
            "impossible to fail", "never fails",
        ]
        hits = [p for p in overconfidence_phrases if p in output_lower]
        if hits:
            return [RiskFlag(
                category="overconfident",
                description="Output makes absolute claims",
                severity=RiskLevel.LOW,
                evidence=f"Phrases detected: {hits[:2]}",
            )]
        return []
