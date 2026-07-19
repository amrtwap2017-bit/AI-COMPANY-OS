"""
app/knowledge/parsers/base.py
────────────────────────────────────────────────────────────────
Base contract for all document parsers.

Every parser receives raw bytes and returns ParseResult.
ParseResult is passed directly to knowledge_ingest.ingest_text().

Rules:
  - Never raise exceptions — return ParseResult(success=False)
  - Never call ingest_text() — caller does that
  - Handle empty content gracefully
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class ParseResult:
    """
    Output of a document parser.
    Ready to be passed to knowledge_ingest.ingest_text().
    """
    success:      bool
    content:      str           = ""
    title:        str           = ""
    doc_type:     str           = "document"
    page_count:   int           = 0
    word_count:   int           = 0
    extra_info:   dict          = field(default_factory=dict)
    error:        str | None    = None

    @property
    def is_empty(self) -> bool:
        return not self.content.strip()


class BaseParser(ABC):
    """
    Every document parser must inherit from this.
    """
    supported_extensions: list[str] = []
    doc_type: str = "document"

    @abstractmethod
    def parse(self, file_bytes: bytes, filename: str = "") -> ParseResult:
        """
        Parse raw bytes and return extracted text.
        Never raises — catches all exceptions internally.
        """
        pass

    def _safe_parse(self, file_bytes: bytes, filename: str = "") -> ParseResult:
        """Safe wrapper — catches unexpected exceptions."""
        try:
            return self.parse(file_bytes, filename)
        except Exception as exc:
            return ParseResult(
                success=False,
                error=f"{self.__class__.__name__} failed: {exc}",
            )
