"""
TB Agent — Codebase Indexer
Reads all source files, chunks them, stores in ChromaDB.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
from typing import Optional
import chromadb
from rich.console import Console
from rich.progress import track
from agent.core.config import (
    WORKSPACE, CHROMA_DIR, SCAN_EXTENSIONS,
    SCAN_EXCLUDE, MAX_FILE_SIZE_KB, CONTEXT_MAX_CHARS,
)
from agent.core.llm import embed

console = Console()
CHUNK_SIZE = 800   # chars per chunk
CHUNK_OVERLAP = 100


def _should_scan(path: Path) -> bool:
    """Returns True if this file should be indexed."""
    if path.suffix not in SCAN_EXTENSIONS:
        return False
    for excl in SCAN_EXCLUDE:
        if excl in path.parts:
            return False
    if path.stat().st_size > MAX_FILE_SIZE_KB * 1024:
        return False
    return True


def _chunk_text(text: str, source: str) -> list[dict]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    idx = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunk = text[start:end]
        chunks.append({
            "text": chunk,
            "source": source,
            "chunk_idx": idx,
            "id": hashlib.md5(f"{source}:{idx}".encode()).hexdigest(),
        })
        start += CHUNK_SIZE - CHUNK_OVERLAP
        idx += 1
    return chunks


def get_collection() -> chromadb.Collection:
    """Get or create ChromaDB collection."""
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    return client.get_or_create_collection(
        name="triangle_black_codebase",
        metadata={"hnsw:space": "cosine"},
    )


def index_codebase(force: bool = False) -> int:
    """
    Scan workspace, embed all files, store in ChromaDB.
    Returns number of chunks indexed.
    """
    collection = get_collection()
    existing = set(collection.get()["ids"]) if not force else set()

    files = [
        p for p in WORKSPACE.rglob("*")
        if p.is_file() and _should_scan(p)
    ]

    console.print(f"[cyan]Found {len(files)} files to index[/cyan]")

    all_chunks = []
    for path in files:
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
            rel = str(path.relative_to(WORKSPACE))
            # Prepend file path as context
            full = f"# FILE: {rel}\n\n{text}"
            chunks = _chunk_text(full, rel)
            all_chunks.extend(chunks)
        except Exception as e:
            console.print(f"[yellow]Skip {path.name}: {e}[/yellow]")

    # Filter already indexed
    new_chunks = [c for c in all_chunks if c["id"] not in existing]
    console.print(f"[cyan]{len(new_chunks)} new chunks to embed[/cyan]")

    if not new_chunks:
        console.print("[green]Index up to date.[/green]")
        return 0

    # Batch embed
    BATCH = 20
    for i in track(range(0, len(new_chunks), BATCH), description="Embedding..."):
        batch = new_chunks[i:i + BATCH]
        texts = [c["text"] for c in batch]
        try:
            vectors = embed(texts)
            collection.add(
                ids=[c["id"] for c in batch],
                embeddings=vectors,
                documents=[c["text"] for c in batch],
                metadatas=[{"source": c["source"], "chunk": c["chunk_idx"]} for c in batch],
            )
        except Exception as e:
            console.print(f"[red]Embed batch {i} failed: {e}[/red]")

    console.print(f"[green]✓ Indexed {len(new_chunks)} chunks[/green]")
    return len(new_chunks)


def search(query: str, n_results: int = 8) -> str:
    """
    Search indexed codebase for relevant context.
    Returns formatted string of top results.
    """
    collection = get_collection()
    total = collection.count()
    if total == 0:
        return "No codebase indexed yet. Run: tb-agent index"

    try:
        vectors = embed([query])
        results = collection.query(
            query_embeddings=vectors,
            n_results=min(n_results, total),
            include=["documents", "metadatas"],
        )
    except Exception as e:
        return f"Search error: {e}"

    parts = []
    seen_sources = set()
    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        source = meta["source"]
        if source not in seen_sources:
            seen_sources.add(source)
            parts.append(f"--- {source} ---\n{doc[:600]}")

    context = "\n\n".join(parts)
    # Trim to max context
    if len(context) > CONTEXT_MAX_CHARS:
        context = context[:CONTEXT_MAX_CHARS] + "\n...[truncated]"
    return context


def get_file(relative_path: str) -> str:
    """Read a specific file from workspace."""
    path = WORKSPACE / relative_path
    if not path.exists():
        return f"File not found: {relative_path}"
    return path.read_text(encoding="utf-8", errors="ignore")


def write_file(relative_path: str, content: str) -> bool:
    """Write content to a workspace file."""
    path = WORKSPACE / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return True
