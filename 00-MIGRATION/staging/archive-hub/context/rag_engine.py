"""
RAG Engine — Semantic Search Over Any Workspace Codebase.

Indexes project files into Qdrant, then does semantic search to find
relevant existing code before generating new code.

Flow:
  index_workspace(workspace_id, workspace_root)
    → reads all source files
    → chunks them (500 chars with 50 char overlap)
    → embeds with nomic-embed-text via Ollama
    → upserts into Qdrant collection: ws_{workspace_id_short}

  search(workspace_id, query, top_k=5)
    → embeds query
    → searches Qdrant
    → returns ranked list of relevant code snippets

  get_relevant_context(workspace_id, task_title, task_description, top_k=8)
    → builds search query from task
    → returns formatted string ready to inject into prompt
"""
from __future__ import annotations

import hashlib
import os
import time
from pathlib import Path
from typing import Any

import httpx

# ── Constants ─────────────────────────────────────────────────────────────────

OLLAMA_BASE   = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
QDRANT_HOST   = os.environ.get("QDRANT_HOST",     "localhost")
QDRANT_PORT   = int(os.environ.get("QDRANT_PORT", "6333"))
QDRANT_BASE   = f"http://{QDRANT_HOST}:{QDRANT_PORT}"
EMBED_MODEL   = "nomic-embed-text"
EMBED_DIM     = 768        # nomic-embed-text dimension
CHUNK_SIZE    = 500        # characters per chunk
CHUNK_OVERLAP = 50         # character overlap between chunks
BATCH_SIZE    = 20         # points per Qdrant upsert batch

SKIP_DIRS = {
    ".venv", "__pycache__", ".git", "node_modules",
    "migrations", "alembic", "dist", "build", ".next",
    ".pytest_cache", ".ruff_cache", "generated",
}

SOURCE_EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".jsx",
    ".go", ".rs", ".java", ".rb", ".php",
    ".md", ".sql", ".yaml", ".yml", ".toml",
}


# ── Collection name helper ────────────────────────────────────────────────────

def _collection_name(workspace_id: str) -> str:
    """Qdrant collection name — short safe slug from workspace_id."""
    short = workspace_id.replace("-", "")[:20]
    return f"ws_{short}"


# ── Embedding ─────────────────────────────────────────────────────────────────

def _embed(text: str, timeout: float = 30.0) -> list[float] | None:
    """Embed text using nomic-embed-text via Ollama. Returns None on error."""
    try:
        resp = httpx.post(
            f"{OLLAMA_BASE}/api/embeddings",
            json={"model": EMBED_MODEL, "prompt": text[:2000]},
            timeout=timeout,
        )
        resp.raise_for_status()
        return resp.json().get("embedding")
    except Exception:
        return None


def _embed_batch(texts: list[str]) -> list[list[float] | None]:
    """Embed a list of texts, returning None for any that fail."""
    return [_embed(t) for t in texts]


# ── Chunking ──────────────────────────────────────────────────────────────────

def _chunk_text(text: str, path: str) -> list[dict]:
    """
    Split file content into overlapping chunks.
    Each chunk carries its source path and position.
    """
    chunks = []
    start  = 0
    idx    = 0
    while start < len(text):
        end     = start + CHUNK_SIZE
        content = text[start:end]
        if content.strip():
            chunks.append({
                "path":        path,
                "content":     content,
                "chunk_index": idx,
                "start_char":  start,
            })
        start += CHUNK_SIZE - CHUNK_OVERLAP
        idx   += 1
    return chunks


# ── File collection ───────────────────────────────────────────────────────────

def _collect_files(workspace_root: str, max_files: int = 200) -> list[Path]:
    """Collect all source files from workspace, skipping irrelevant dirs."""
    root   = Path(workspace_root)
    result = []

    for p in root.rglob("*"):
        if not p.is_file():
            continue
        # Skip blacklisted directories
        if any(skip in p.parts for skip in SKIP_DIRS):
            continue
        # Only index source file types
        if p.suffix.lower() not in SOURCE_EXTENSIONS:
            continue
        # Skip very large files (> 100KB)
        try:
            if p.stat().st_size > 100_000:
                continue
        except Exception:
            continue
        result.append(p)
        if len(result) >= max_files:
            break

    return result


# ── Qdrant helpers ────────────────────────────────────────────────────────────

def _qdrant_get(path: str, timeout: float = 10.0) -> Any:
    try:
        resp = httpx.get(f"{QDRANT_BASE}{path}", timeout=timeout)
        return resp.json() if resp.status_code == 200 else None
    except Exception:
        return None


def _qdrant_put(path: str, body: dict, timeout: float = 30.0) -> bool:
    try:
        resp = httpx.put(
            f"{QDRANT_BASE}{path}",
            json=body,
            timeout=timeout,
        )
        return resp.status_code in (200, 201)
    except Exception:
        return False


def _qdrant_post(path: str, body: dict, timeout: float = 30.0) -> Any:
    try:
        resp = httpx.post(
            f"{QDRANT_BASE}{path}",
            json=body,
            timeout=timeout,
        )
        return resp.json() if resp.status_code == 200 else None
    except Exception:
        return None


def _ensure_collection(collection: str) -> bool:
    """Create Qdrant collection if it doesn't exist."""
    existing = _qdrant_get(f"/collections/{collection}")
    if existing:
        return True  # already exists

    return _qdrant_put(
        f"/collections/{collection}",
        {
            "vectors": {
                "size":     EMBED_DIM,
                "distance": "Cosine",
            }
        },
    )


def _point_id(path: str, chunk_index: int) -> int:
    """Stable numeric ID for a chunk based on path + index."""
    raw = f"{path}:{chunk_index}"
    return int(hashlib.md5(raw.encode()).hexdigest()[:15], 16)


def _upsert_batch(collection: str, points: list[dict]) -> bool:
    """Upsert a batch of points into Qdrant. Qdrant requires PUT not POST."""
    import httpx as _httpx
    try:
        resp = _httpx.put(
            f"{QDRANT_BASE}/collections/{collection}/points",
            json={"points": points},
            timeout=60.0,
        )
        return resp.status_code == 200
    except Exception:
        return False


def index_workspace(
    workspace_id: str,
    workspace_root: str,
    force: bool = False,
) -> dict:
    """
    Index all source files from workspace_root into Qdrant.

    Args:
        workspace_id:   Hub workspace ID (used as collection key)
        workspace_root: Absolute path to project root
        force:          If True, re-index even if collection exists

    Returns:
        {
          "ok": bool,
          "collection": str,
          "files_processed": int,
          "chunks_indexed": int,
          "chunks_skipped": int,  (embedding failed)
          "duration_seconds": float,
        }
    """
    t0         = time.time()
    collection = _collection_name(workspace_id)

    # Ensure Qdrant collection exists
    if not _ensure_collection(collection):
        return {
            "ok":    False,
            "error": f"Failed to create Qdrant collection: {collection}",
        }

    # Collect files
    files = _collect_files(workspace_root)
    if not files:
        return {
            "ok":             True,
            "collection":     collection,
            "files_processed": 0,
            "chunks_indexed":  0,
            "chunks_skipped":  0,
            "duration_seconds": round(time.time() - t0, 2),
            "warning":        "No source files found",
        }

    root            = Path(workspace_root)
    chunks_indexed  = 0
    chunks_skipped  = 0
    batch_points    = []

    for file_path in files:
        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue

        rel_path = str(file_path.relative_to(root))
        chunks   = _chunk_text(content, rel_path)

        for chunk in chunks:
            vector = _embed(chunk["content"])
            if not vector:
                chunks_skipped += 1
                continue

            point = {
                "id":      _point_id(rel_path, chunk["chunk_index"]),
                "vector":  vector,
                "payload": {
                    "path":         rel_path,
                    "content":      chunk["content"],
                    "workspace_id": workspace_id,
                    "file_type":    file_path.suffix.lstrip("."),
                    "chunk_index":  chunk["chunk_index"],
                },
            }
            batch_points.append(point)

            # Flush batch
            if len(batch_points) >= BATCH_SIZE:
                _upsert_batch(collection, batch_points)
                chunks_indexed += len(batch_points)
                batch_points    = []

    # Flush remainder
    if batch_points:
        _upsert_batch(collection, batch_points)
        chunks_indexed += len(batch_points)

    return {
        "ok":              True,
        "collection":      collection,
        "files_processed": len(files),
        "chunks_indexed":  chunks_indexed,
        "chunks_skipped":  chunks_skipped,
        "duration_seconds": round(time.time() - t0, 2),
    }


def search(
    workspace_id: str,
    query: str,
    top_k: int = 5,
    file_type_filter: str | None = None,
) -> list[dict]:
    """
    Semantic search over workspace source files.

    Args:
        workspace_id:      Hub workspace ID
        query:             Natural language or code query
        top_k:             Number of results to return
        file_type_filter:  Optional file extension filter (e.g. "py")

    Returns:
        List of {path, content, score, file_type, chunk_index}
        Sorted by score descending.
    """
    collection = _collection_name(workspace_id)

    # Check collection exists
    if not _qdrant_get(f"/collections/{collection}"):
        return []

    # Embed query
    vector = _embed(query)
    if not vector:
        return []

    # Build search request
    search_body: dict = {
        "vector": vector,
        "limit":  top_k,
        "with_payload": True,
    }
    if file_type_filter:
        search_body["filter"] = {
            "must": [{
                "key":   "file_type",
                "match": {"value": file_type_filter},
            }]
        }

    result = _qdrant_post(
        f"/collections/{collection}/points/search",
        search_body,
    )

    if not result or "result" not in result:
        return []

    hits = []
    for hit in result["result"]:
        payload = hit.get("payload", {})
        hits.append({
            "path":        payload.get("path", ""),
            "content":     payload.get("content", ""),
            "score":       round(hit.get("score", 0.0), 4),
            "file_type":   payload.get("file_type", ""),
            "chunk_index": payload.get("chunk_index", 0),
        })

    return hits


def get_relevant_context(
    workspace_id: str,
    task_title: str,
    task_description: str = "",
    top_k: int = 8,
) -> str:
    """
    Build a formatted context string of relevant code for prompt injection.

    Searches for code semantically related to the task, returns a
    formatted string ready to inject into the developer agent's prompt.

    Returns empty string if Qdrant is unavailable or no results found.
    """
    if not task_title:
        return ""

    # Build a rich query from task
    query = f"{task_title}\n{task_description}".strip()

    # Search for relevant code
    results = search(workspace_id, query, top_k=top_k)
    if not results:
        return ""

    # Deduplicate by path (keep highest score per file)
    seen_paths: dict[str, dict] = {}
    for hit in results:
        path = hit["path"]
        if path not in seen_paths or hit["score"] > seen_paths[path]["score"]:
            seen_paths[path] = hit

    # Format as prompt context
    lines = [
        "SEMANTICALLY RELEVANT CODE FROM THIS PROJECT",
        "(These are real files from the codebase — "
        "follow the same patterns when generating new code):",
        "",
    ]

    for hit in sorted(seen_paths.values(), key=lambda x: x["score"], reverse=True)[:6]:
        lines.append(f"--- {hit['path']} (relevance: {hit['score']}) ---")
        lines.append(hit["content"][:600])
        lines.append("")

    return "\n".join(lines)


def collection_info(workspace_id: str) -> dict:
    """Return info about the workspace's Qdrant collection."""
    collection = _collection_name(workspace_id)
    info       = _qdrant_get(f"/collections/{collection}")
    if not info:
        return {"exists": False, "collection": collection}

    result = info.get("result", {})
    return {
        "exists":     True,
        "collection": collection,
        "points":     result.get("points_count", 0),
        "status":     result.get("status", "unknown"),
    }


def delete_collection(workspace_id: str) -> bool:
    """Delete a workspace's Qdrant collection (use before re-indexing)."""
    collection = _collection_name(workspace_id)
    try:
        resp = httpx.delete(f"{QDRANT_BASE}/collections/{collection}", timeout=10)
        return resp.status_code in (200, 404)
    except Exception:
        return False
