"""
app/knowledge/parsers/registry.py
────────────────────────────────────────────────────────────────
Auto-detects document type by file extension.
Returns the correct parser for any uploaded file.

Usage:
    parser = parser_registry.get(".docx")
    result = parser.parse(file_bytes, filename)
"""

from __future__ import annotations

import logging

from knowledge.parsers.base import BaseParser, ParseResult
from knowledge.parsers.docx_parser  import docx_parser
from knowledge.parsers.xlsx_parser  import xlsx_parser
from knowledge.parsers.image_parser import image_parser

log = logging.getLogger(__name__)


class ParserRegistry:

    def __init__(self) -> None:
        self._parsers: dict[str, BaseParser] = {}
        self._register_all()

    def _register_all(self) -> None:
        for parser in [docx_parser, xlsx_parser, image_parser]:
            for ext in parser.supported_extensions:
                self._parsers[ext.lower()] = parser
                log.debug("Registered parser %s for %s", type(parser).__name__, ext)

    def get(self, extension: str) -> BaseParser | None:
        """Get parser for a file extension (with or without dot)."""
        ext = extension.lower()
        if not ext.startswith("."):
            ext = f".{ext}"
        return self._parsers.get(ext)

    def get_by_filename(self, filename: str) -> BaseParser | None:
        """Get parser by filename, auto-detecting extension."""
        if "." not in filename:
            return None
        ext = "." + filename.rsplit(".", 1)[-1].lower()
        return self._parsers.get(ext)

    def supported_extensions(self) -> list[str]:
        """Return all supported file extensions."""
        return sorted(self._parsers.keys())

    def supported_types(self) -> dict[str, list[str]]:
        """Return dict of parser_name → extensions."""
        result: dict[str, list[str]] = {}
        for ext, parser in self._parsers.items():
            name = type(parser).__name__
            result.setdefault(name, []).append(ext)
        return result

    def parse(
        self,
        file_bytes: bytes,
        filename: str,
    ) -> ParseResult:
        """
        Parse a document by auto-detecting its type from filename.
        Returns ParseResult(success=False) if type not supported.
        """
        parser = self.get_by_filename(filename)

        if not parser:
            ext = ("." + filename.rsplit(".", 1)[-1]) if "." in filename else "unknown"
            return ParseResult(
                success=False,
                error=(
                    f"Unsupported file type: {ext!r}. "
                    f"Supported: {self.supported_extensions()}"
                ),
            )

        return parser._safe_parse(file_bytes, filename)


parser_registry = ParserRegistry()
