"""
app/memory/compressor.py
────────────────────────────────────────────────────────────────
Compresses old short-term memories into a single summary.

When an agent accumulates more than MAX_SHORT_TERM memories,
the oldest ones are summarized and replaced with one entry.

This keeps memory lean without losing information.
"""

from __future__ import annotations

import logging

from models.db.memory_entry import MemoryEntry

log = logging.getLogger(__name__)

MAX_SHORT_TERM = 20
COMPRESS_TO    = 10


class MemoryCompressor:

    def should_compress(
        self,
        entries: list[MemoryEntry],
        memory_type: str = "short_term",
    ) -> bool:
        short_term = [e for e in entries if e.memory_type == memory_type]
        return len(short_term) > MAX_SHORT_TERM

    def select_for_compression(
        self,
        entries: list[MemoryEntry],
    ) -> list[MemoryEntry]:
        """Return oldest short-term entries that should be compressed."""
        short_term = [
            e for e in entries if e.memory_type == "short_term"
        ]
        short_term.sort(key=lambda e: e.created_at)
        count_to_remove = len(short_term) - COMPRESS_TO
        return short_term[:max(count_to_remove, 0)]

    def build_summary_content(
        self,
        entries: list[MemoryEntry],
        agent_name: str,
    ) -> str:
        """Build a compressed summary string from multiple entries."""
        if not entries:
            return ""
        lines = [f"[Compressed memory for {agent_name}]"]
        for e in entries:
            preview = e.content[:120].replace("\n", " ")
            lines.append(f"- {preview}")
        return "\n".join(lines)

    def build_compressed_entry(
        self,
        entries: list[MemoryEntry],
        agent_name: str,
    ) -> MemoryEntry:
        """Create a single MemoryEntry that replaces many."""
        summary = self.build_summary_content(entries, agent_name)
        return MemoryEntry(
            agent_name=agent_name,
            memory_type="short_term",
            content=summary,
            importance=0.4,
            extra_data={"compressed_count": len(entries)},
        )
