"""
app/context/ranker.py
────────────────────────────────────────────────────────────────
Scores, ranks, and trims context items to fit model window.

The model has a finite context window.
This ranker ensures the most important context is kept
when total context exceeds the character budget.

Default budget: 6000 characters (~1500 tokens at 4 chars/token)
"""

from __future__ import annotations

from context.sources import ContextItem

DEFAULT_CHAR_BUDGET = 6000

SOURCE_PRIORITY: dict[str, float] = {
    "system":       3.0,
    "conversation": 2.0,
    "memory":       1.5,
    "knowledge":    1.0,
}


class ContextRanker:

    def __init__(self, char_budget: int = DEFAULT_CHAR_BUDGET) -> None:
        self._budget = char_budget

    def rank_and_trim(
        self,
        items: list[ContextItem],
    ) -> list[ContextItem]:
        """Sort by priority, trim to fit within char budget."""
        scored = [
            (item, self._score(item))
            for item in items
        ]
        scored.sort(key=lambda x: x[1], reverse=True)

        result: list[ContextItem] = []
        total_chars = 0

        for item, _ in scored:
            item_len = len(item.content)
            if total_chars + item_len > self._budget:
                remaining = self._budget - total_chars
                if remaining > 100:
                    trimmed = ContextItem(
                        source=item.source,
                        content=item.content[:remaining] + "...",
                        weight=item.weight,
                        extra=item.extra,
                    )
                    result.append(trimmed)
                break
            result.append(item)
            total_chars += item_len

        return result

    def _score(self, item: ContextItem) -> float:
        priority = SOURCE_PRIORITY.get(item.source, 1.0)
        return item.weight * priority
