"""
Document parsers for Sprint 26 — Document Intelligence.

Supported types:
  .docx          Microsoft Word (python-docx)
  .xlsx / .xls   Microsoft Excel (openpyxl)
  .png/.jpg/...  Images with OCR (pytesseract + Pillow)
  .pdf           Already handled by knowledge_ingest.ingest_pdf()

Usage:
    from app.knowledge.parsers.registry import parser_registry

    result = parser_registry.parse(file_bytes, "report.docx")
    if result.success:
        knowledge_ingest.ingest_text(
            title=result.title,
            content=result.content,
            source="upload",
            doc_type=result.doc_type,
        )
"""

from app.knowledge.parsers.registry import parser_registry, ParserRegistry
from app.knowledge.parsers.base     import BaseParser, ParseResult

__all__ = ["parser_registry", "ParserRegistry", "BaseParser", "ParseResult"]
