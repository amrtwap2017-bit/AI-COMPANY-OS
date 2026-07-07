"""
Knowledge Ingester
==================
Multi-format document parser and ingestion pipeline.

Supported formats:
  Markdown (.md)     → preserve headers as chunk metadata
  Plain text (.txt)  → basic chunking
  Python (.py)       → code-aware chunking
  JSON (.json)       → flatten to text representation
  Source code        → language-aware chunking

Pipeline:
  file → parse → chunk → embed → upsert to Qdrant

Every ingested document is tracked by SHA-256 hash.
Re-ingesting an unchanged document is a no-op (incremental updates).
"""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
from typing import Any
from uuid import uuid4

from .chunker import DocumentChunker, chunk_code_file, DocumentChunk


# ─── File Type Handlers ───────────────────────────────────────────────────────

def parse_markdown(content: str, file_path: str) -> list[tuple[str, dict]]:
    """
    Parse Markdown into sections with header metadata.
    Returns list of (text_section, metadata) tuples.
    """
    sections = []
    current_header = ""
    current_content = []

    for line in content.split("\n"):
        if line.startswith("#"):
            if current_content:
                sections.append((
                    "\n".join(current_content),
                    {"header": current_header, "doc_type": "markdown", "file_path": file_path},
                ))
            current_header = line.lstrip("#").strip()
            current_content = [line]
        else:
            current_content.append(line)

    if current_content:
        sections.append((
            "\n".join(current_content),
            {"header": current_header, "doc_type": "markdown", "file_path": file_path},
        ))

    return sections


def parse_python(content: str, file_path: str) -> list[tuple[str, dict]]:
    """Extract docstrings and function signatures as searchable text."""
    import ast
    sections = []

    try:
        tree = ast.parse(content)
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                name = node.name
                docstring = ast.get_docstring(node) or ""
                section_text = f"{type(node).__name__} {name}\n{docstring}"
                sections.append((
                    section_text,
                    {"doc_type": "code", "symbol": name, "file_path": file_path, "language": "python"},
                ))
    except SyntaxError:
        pass

    # Also return full file for code search
    sections.append((content, {"doc_type": "code", "file_path": file_path, "language": "python"}))
    return sections


def parse_json(content: str, file_path: str) -> list[tuple[str, dict]]:
    """Convert JSON to readable text representation."""
    try:
        data = json.loads(content)
        readable = json.dumps(data, indent=2)
        return [(readable, {"doc_type": "json", "file_path": file_path})]
    except json.JSONDecodeError:
        return [(content, {"doc_type": "text", "file_path": file_path})]


PARSERS = {
    ".md": parse_markdown,
    ".markdown": parse_markdown,
    ".py": parse_python,
    ".json": parse_json,
    ".txt": lambda c, p: [(c, {"doc_type": "text", "file_path": p})],
    ".yaml": lambda c, p: [(c, {"doc_type": "yaml", "file_path": p})],
    ".yml": lambda c, p: [(c, {"doc_type": "yaml", "file_path": p})],
    ".toml": lambda c, p: [(c, {"doc_type": "toml", "file_path": p})],
    ".ts": lambda c, p: [(c, {"doc_type": "code", "language": "typescript", "file_path": p})],
    ".tsx": lambda c, p: [(c, {"doc_type": "code", "language": "tsx", "file_path": p})],
    ".js": lambda c, p: [(c, {"doc_type": "code", "language": "javascript", "file_path": p})],
}


class KnowledgeIngester:
    """
    Ingests documents into the workspace vector store.

    Tracks document state by SHA-256 hash to enable incremental updates.
    Only re-indexes changed or new documents.
    """

    def __init__(
        self,
        workspace_id: str,
        workspace_slug: str,
        vector_store,  # WorkspaceVectorStore
    ) -> None:
        self.workspace_id = workspace_id
        self.workspace_slug = workspace_slug
        self.vector_store = vector_store
        self.chunker = DocumentChunker(chunk_size=1000, chunk_overlap=150)
        self._ingested_hashes: dict[str, str] = {}

    async def ingest_file(self, file_path: str) -> dict[str, Any]:
        """
        Ingest a single file into the workspace knowledge base.

        Returns:
            {
                "document_id": str,
                "file_path": str,
                "chunks_created": int,
                "was_skipped": bool,  # True if file unchanged
                "file_hash": str,
            }
        """
        path = Path(file_path)
        if not path.exists():
            return {"error": f"File not found: {file_path}", "chunks_created": 0}

        try:
            content = path.read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            return {"error": str(e), "chunks_created": 0}

        file_hash = hashlib.sha256(content.encode()).hexdigest()

        # Skip if unchanged
        if self._ingested_hashes.get(str(file_path)) == file_hash:
            return {
                "document_id": None,
                "file_path": str(file_path),
                "chunks_created": 0,
                "was_skipped": True,
                "file_hash": file_hash,
            }

        document_id = str(uuid4())
        extension = path.suffix.lower()
        parser = PARSERS.get(extension)

        if not parser:
            return {
                "document_id": document_id,
                "file_path": str(file_path),
                "chunks_created": 0,
                "was_skipped": True,
                "file_hash": file_hash,
                "reason": f"No parser for extension {extension}",
            }

        sections = parser(content, str(file_path))
        all_chunks: list[DocumentChunk] = []

        for section_text, metadata in sections:
            if not section_text.strip():
                continue
            metadata["file_hash"] = file_hash
            chunks = self.chunker.chunk_document(
                section_text,
                document_id,
                self.workspace_id,
                metadata=metadata,
            )
            all_chunks.extend(chunks)

        if not all_chunks:
            return {"document_id": document_id, "chunks_created": 0, "was_skipped": False}

        # Embed and store
        from .04_VECTOR.qdrant_client import get_embeddings_batch

        texts = [c.content for c in all_chunks]
        embeddings = await get_embeddings_batch(texts)

        points = [
            {
                "id": chunk.chunk_id,
                "vector": embedding,
                "payload": chunk.to_vector_payload(),
            }
            for chunk, embedding in zip(all_chunks, embeddings)
        ]

        await self.vector_store.upsert("knowledge", points)
        self._ingested_hashes[str(file_path)] = file_hash

        return {
            "document_id": document_id,
            "file_path": str(file_path),
            "chunks_created": len(all_chunks),
            "was_skipped": False,
            "file_hash": file_hash,
        }

    async def ingest_directory(
        self,
        directory: str,
        extensions: list[str] | None = None,
        exclude_patterns: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Recursively ingest all supported files in a directory.

        Returns summary of ingestion results.
        """
        extensions = extensions or list(PARSERS.keys())
        exclude_patterns = exclude_patterns or [
            ".venv", "__pycache__", ".git", "node_modules",
            ".pytest_cache", "dist", "build",
        ]

        results = {
            "directory": directory,
            "total_files": 0,
            "ingested": 0,
            "skipped": 0,
            "errors": 0,
            "total_chunks": 0,
            "files": [],
        }

        path = Path(directory)
        if not path.exists():
            results["error"] = f"Directory not found: {directory}"
            return results

        for file_path in path.rglob("*"):
            if not file_path.is_file():
                continue

            if any(ex in str(file_path) for ex in exclude_patterns):
                continue

            if file_path.suffix.lower() not in extensions:
                continue

            results["total_files"] += 1
            result = await self.ingest_file(str(file_path))

            if result.get("error"):
                results["errors"] += 1
            elif result.get("was_skipped"):
                results["skipped"] += 1
            else:
                results["ingested"] += 1
                results["total_chunks"] += result.get("chunks_created", 0)

            results["files"].append(result)

        return results

    async def ingest_text(
        self,
        content: str,
        title: str,
        doc_type: str = "document",
        extra_metadata: dict | None = None,
    ) -> dict[str, Any]:
        """
        Ingest raw text content directly (no file required).
        Used for meeting notes, requirements, descriptions.
        """
        from .04_VECTOR.qdrant_client import get_embeddings_batch

        document_id = str(uuid4())
        metadata = {
            "title": title,
            "doc_type": doc_type,
            "workspace_id": self.workspace_id,
            **(extra_metadata or {}),
        }

        chunks = self.chunker.chunk_document(
            content, document_id, self.workspace_id, metadata=metadata
        )
        if not chunks:
            return {"document_id": document_id, "chunks_created": 0}

        embeddings = await get_embeddings_batch([c.content for c in chunks])
        points = [
            {"id": c.chunk_id, "vector": e, "payload": c.to_vector_payload()}
            for c, e in zip(chunks, embeddings)
        ]

        await self.vector_store.upsert("knowledge", points)
        return {"document_id": document_id, "title": title, "chunks_created": len(chunks)}
