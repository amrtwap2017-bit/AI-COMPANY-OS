"""
app/memory/promoter.py
────────────────────────────────────────────────────────────────
Promotes short-term memories to long-term based on importance.

Promotion rules:
  - Score >= PROMOTION_THRESHOLD → promote to long_term
  - Failures always promoted (agents must remember what went wrong)
  - Decisions always promoted
"""

from __future__ import annotations

import logging

from models.db.memory_entry import MemoryEntry

log = logging.getLogger(__name__)

PROMOTION_THRESHOLD = 0.75

# Keywords that trigger automatic promotion
PROMOTION_KEYWORDS = [
    "decided", "failed", "error", "critical",
    "important", "remember", "lesson", "conclusion",
]


class MemoryPromoter:

    def should_promote(
        self,
        entry: MemoryEntry,
        score: float,
    ) -> bool:
        if entry.memory_type == "long_term":
            return False
        if score >= PROMOTION_THRESHOLD:
            return True
        content_lower = entry.content.lower()
        return any(kw in content_lower for kw in PROMOTION_KEYWORDS)

    def filter_for_promotion(
        self,
        scored: list[tuple[MemoryEntry, float]],
    ) -> list[MemoryEntry]:
        """Return entries that qualify for promotion."""
        return [
            entry for entry, score in scored
            if self.should_promote(entry, score)
        ]
