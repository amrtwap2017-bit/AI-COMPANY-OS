"""
TB Agent Codebase Indexer — indexes .py .tsx .ts .md files into ChromaDB
"""
from __future__ import annotations
import os
import hashlib
from pathlib import Path

# Project root is two levels up from this file (agent/memory/indexer.py)
PROJECT_ROOT = Path(__file__).parent.parent.parent

INCLUDE_EXTENSIONS = {".py", ".tsx", ".ts", ".md"}
EXCLUDE_DIRS = {
    ".git", ".next", "node_modules", "__pycache__",
    ".venv", "dist", ".chromadb", "build",
}

CHROMA_PATH = str(Path(__file__).parent.parent / ".chromadb")


def _get_files(root: Path) -> list[Path]:
    """Walk project and return all indexable files."""
    files = []
    for path in root.rglob("*"):
        # Skip excluded directories
        if any(ex in path.parts for ex in EXCLUDE_DIRS):
            continue
        if path.is_file() and path.suffix in INCLUDE_EXTENSIONS:
            files.append(path)
    return sorted(files)


def _file_hash(path: Path) -> str:
    """Return MD5 hash of file content for change detection."""
    return hashlib.md5(path.read_bytes()).hexdigest()


def _chunk_text(text: str, chunk_size: int = 1000) -> list[str]:
    """Split text into overlapping chunks for embedding."""
    lines = text.splitlines()
    chunks = []
    current = []
    current_len = 0

    for line in lines:
        current.append(line)
        current_len += len(line)
        if current_len >= chunk_size:
            chunks.append("\n".join(current))
            # Overlap: keep last 10 lines
            current = current[-10:]
            current_len = sum(len(l) for l in current)

    if current:
        chunks.append("\n".join(current))

    return chunks or [text[:chunk_size]]


class CodebaseIndexer:
    """Indexes the Triangle Black codebase into ChromaDB."""

    def __init__(self):
        self._collection = None

    def _get_collection(self):
        """Lazy-load ChromaDB collection."""
        if self._collection is not None:
            return self._collection
        try:
            import chromadb
            client = chromadb.PersistentClient(path=CHROMA_PATH)
            self._collection = client.get_or_create_collection(
                name="triangle_black_codebase",
                metadata={"description": "Triangle Black source code"},
            )
            return self._collection
        except ImportError:
            raise ImportError(
                "chromadb not installed. Run: "
                "uv pip install --python .venv/bin/python chromadb"
            )

    def index(self, force: bool = False) -> dict:
        """Index all project files. Returns stats dict."""
        col = self._get_collection()
        files = _get_files(PROJECT_ROOT)

        indexed = 0
        skipped = 0
        errors  = 0

        print(f"📁 Found {len(files)} files to process...")

        for i, path in enumerate(files):
            rel = str(path.relative_to(PROJECT_ROOT))
            if i % 50 == 0 and i > 0:
                print(f"  Progress: {i}/{len(files)} files...")

            try:
                content = path.read_text(errors="replace")
                if not content.strip():
                    skipped += 1
                    continue

                file_hash = _file_hash(path)
                doc_id    = f"file::{rel}"

                # Check if already indexed with same content
                if not force:
                    try:
                        existing = col.get(ids=[doc_id], include=["metadatas"])
                        if existing["ids"] and existing["metadatas"]:
                            stored_hash = existing["metadatas"][0].get("hash", "")
                            if stored_hash == file_hash:
                                skipped += 1
                                continue
                    except Exception:
                        pass

                # Chunk and upsert
                chunks = _chunk_text(content)
                for ci, chunk in enumerate(chunks):
                    chunk_id = f"{doc_id}::chunk{ci}"
                    col.upsert(
                        ids=[chunk_id],
                        documents=[chunk],
                        metadatas=[{
                            "file":  rel,
                            "hash":  file_hash,
                            "chunk": ci,
                            "ext":   path.suffix,
                        }],
                    )
                indexed += 1

            except Exception as e:
                errors += 1
                print(f"  ⚠ Error indexing {rel}: {e}")

        stats = {
            "total":   len(files),
            "indexed": indexed,
            "skipped": skipped,
            "errors":  errors,
        }
        print(f"\n✅ Indexing complete: {indexed} indexed, {skipped} skipped, {errors} errors")
        return stats

    def search(self, query: str, n_results: int = 5) -> list[dict]:
        """Search indexed codebase. Returns list of {file, content, score}."""
        col = self._get_collection()
        try:
            results = col.query(
                query_texts=[query],
                n_results=min(n_results, col.count()),
                include=["documents", "metadatas", "distances"],
            )
            output = []
            for doc, meta, dist in zip(
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0],
            ):
                output.append({
                    "file":    meta.get("file", "unknown"),
                    "content": doc,
                    "score":   round(1 - dist, 3),
                })
            return output
        except Exception as e:
            print(f"❌ Search error: {e}")
            return []

    def count(self) -> int:
        """Return number of indexed chunks."""
        try:
            return self._get_collection().count()
        except Exception:
            return 0
