"""
app/memory/ranker.py
────────────────────────────────────────────────────────────────
Scores memory entries by importance.

Importance factors:
  - Recency       Recent memories score higher
  - Type weight   Decisions and failures outrank casual chat
  - Length        Longer content carries more information

Score range: 0.0 — 1.0
"""

from __future__ import annotations

import math
from datetime import datetime, timezone

from models.db.memory_entry import MemoryEntry

TYPE_WEIGHTS: dict[str, float] = {
    "long_term":  1.0,
    "semantic":   0.8,
    "episodic":   0.7,
    "short_term": 0.5,
}

HALF_LIFE_HOURS = 72.0


class MemoryRanker:

    def score(self, entry: MemoryEntry) -> float:
        """Return importance score 0.0–1.0 for a single entry."""
        recency  = self._recency_score(entry.created_at)
        type_w   = TYPE_WEIGHTS.get(entry.memory_type, 0.5)
        length_w = self._length_score(entry.content)

        raw = (recency * 0.5) + (type_w * 0.35) + (length_w * 0.15)
        return round(min(max(raw, 0.0), 1.0), 4)

    def score_all(
        self,
        entries: list[MemoryEntry],
    ) -> list[tuple[MemoryEntry, float]]:
        """Score a list and return sorted (entry, score) pairs."""
        scored = [(e, self.score(e)) for e in entries]
        return sorted(scored, key=lambda x: x[1], reverse=True)

    def _recency_score(self, created_at: datetime | None) -> float:
        # Entry not yet saved — treat as brand new
        if created_at is None:
            return 1.0
        now = datetime.now(timezone.utc)
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        hours_old = (now - created_at).total_seconds() / 3600
        return math.exp(-0.693 * hours_old / HALF_LIFE_HOURS)

    def _length_score(self, content: str) -> float:
        length = len(content)
        if length < 50:
            return 0.2
        if length < 200:
            return 0.5
        if length < 500:
            return 0.8
        return 1.0
