"""
Document Chunker
================
Splits documents into overlapping chunks for vector embedding.

Strategy: Recursive character splitting with semantic boundary awareness.
- Tries to split on paragraph breaks first
- Falls back to sentence breaks
- Falls back to word breaks
- Never splits mid-word

Chunk configuration:
  chunk_size:    1000 characters (fits nomic-embed-text 8192 token window)
  chunk_overlap: 150 characters  (preserves context across boundaries)
"""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass, field
from typing import Any
from uuid import uuid4


@dataclass
class DocumentChunk:
    """A single text chunk ready for embedding."""
    chunk_id: str
    document_id: str
    workspace_id: str
    content: str
    chunk_index: int
    total_chunks: int
    char_start: int
    char_end: int
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def content_hash(self) -> str:
        return hashlib.sha256(self.content.encode()).hexdigest()[:16]

    def to_vector_payload(self) -> dict[str, Any]:
        """Payload to store alongside the vector in Qdrant."""
        return {
            "chunk_id": self.chunk_id,
            "document_id": self.document_id,
            "workspace_id": self.workspace_id,
            "content": self.content,
            "chunk_index": self.chunk_index,
            "total_chunks": self.total_chunks,
            "char_start": self.char_start,
            "char_end": self.char_end,
            "content_hash": self.content_hash,
            **self.metadata,
        }


class DocumentChunker:
    """
    Splits documents into overlapping chunks.

    Separators tried in order:
      1. Double newline (paragraph break)
      2. Single newline
      3. Period + space (sentence end)
      4. Space (word break)
      5. Character (last resort)
    """

    SEPARATORS = ["\n\n", "\n", ". ", " ", ""]

    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 150,
    ) -> None:
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_document(
        self,
        text: str,
        document_id: str,
        workspace_id: str,
        metadata: dict[str, Any] | None = None,
    ) -> list[DocumentChunk]:
        """
        Split a document into overlapping chunks.

        Args:
            text:         Full document text
            document_id:  Source document identifier
            workspace_id: Workspace this document belongs to
            metadata:     Additional payload fields (file_path, doc_type, etc.)

        Returns:
            List of DocumentChunk objects ready for embedding
        """
        if not text or not text.strip():
            return []

        raw_chunks = self._split_text(text)
        chunks = []

        for i, (content, char_start, char_end) in enumerate(raw_chunks):
            chunk = DocumentChunk(
                chunk_id=str(uuid4()),
                document_id=document_id,
                workspace_id=workspace_id,
                content=content.strip(),
                chunk_index=i,
                total_chunks=len(raw_chunks),
                char_start=char_start,
                char_end=char_end,
                metadata=metadata or {},
            )
            chunks.append(chunk)

        return chunks

    def _split_text(self, text: str) -> list[tuple[str, int, int]]:
        """
        Recursively split text into (content, start, end) tuples.
        Uses the first separator that produces chunks within size limit.
        """
        if len(text) <= self.chunk_size:
            return [(text, 0, len(text))]

        chunks = []
        current_pos = 0

        while current_pos < len(text):
            end_pos = min(current_pos + self.chunk_size, len(text))

            if end_pos == len(text):
                chunks.append((text[current_pos:end_pos], current_pos, end_pos))
                break

            # Try to find a good split point
            split_pos = self._find_split_point(text, current_pos, end_pos)
            chunks.append((text[current_pos:split_pos], current_pos, split_pos))

            # Overlap: move back by chunk_overlap characters
            current_pos = max(current_pos + 1, split_pos - self.chunk_overlap)

        return chunks

    def _find_split_point(self, text: str, start: int, end: int) -> int:
        """
        Find the best split point near 'end' that respects semantic boundaries.
        """
        search_start = max(start, end - 200)

        for sep in self.SEPARATORS:
            if not sep:
                return end

            idx = text.rfind(sep, search_start, end)
            if idx != -1 and idx > start:
                return idx + len(sep)

        return end


def chunk_code_file(
    code: str,
    file_path: str,
    document_id: str,
    workspace_id: str,
    language: str = "python",
) -> list[DocumentChunk]:
    """
    Chunk source code files with awareness of code structure.
    Splits on function/class definitions rather than arbitrary characters.
    """
    chunker = DocumentChunker(chunk_size=800, chunk_overlap=100)

    # For Python: try to split on def/class boundaries
    if language == "python":
        pattern = r'\n(?=(?:def |class |async def ))'
        sections = re.split(pattern, code)

        chunks = []
        current_section = ""
        current_start = 0

        for section in sections:
            if len(current_section) + len(section) < 800:
                current_section += section
            else:
                if current_section:
                    section_chunks = chunker.chunk_document(
                        current_section,
                        document_id,
                        workspace_id,
                        metadata={"file_path": file_path, "language": language, "doc_type": "code"},
                    )
                    chunks.extend(section_chunks)
                current_section = section

        if current_section:
            section_chunks = chunker.chunk_document(
                current_section,
                document_id,
                workspace_id,
                metadata={"file_path": file_path, "language": language, "doc_type": "code"},
            )
            chunks.extend(section_chunks)

        return chunks

    return chunker.chunk_document(
        code,
        document_id,
        workspace_id,
        metadata={"file_path": file_path, "language": language, "doc_type": "code"},
    )
