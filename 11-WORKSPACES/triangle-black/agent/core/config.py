"""
TB Agent — Configuration
All model routing and paths in one place.
"""
from __future__ import annotations
import os
from pathlib import Path

# ── Paths ─────────────────────────────────────────────────────────────────────
WORKSPACE    = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
AGENT_DIR    = WORKSPACE / "agent"
MEMORY_DIR   = AGENT_DIR / "memory"
PLANS_DIR    = AGENT_DIR / "plans"
CHROMA_DIR   = AGENT_DIR / ".chromadb"

# ── Ollama Models ──────────────────────────────────────────────────────────────
PLANNER_MODEL  = "deepseek-r1:8b"     # architecture, reasoning, decisions
CODER_MODEL    = "qwen2.5-coder:7b"   # code generation, file writing
REVIEWER_MODEL = "qwen3.5:4b"         # fast review, validation
EMBED_MODEL    = "nomic-embed-text"    # vector embeddings

# ── Ollama endpoint ────────────────────────────────────────────────────────────
OLLAMA_HOST = "http://localhost:11434"

# ── API ───────────────────────────────────────────────────────────────────────
TB_API      = "http://127.0.0.1:8020"
TB_EMAIL    = "amr@triangleblack.com"
TB_PASSWORD = "Admin123!"

# ── Files to index (scan these for codebase knowledge) ────────────────────────
SCAN_EXTENSIONS = {".py", ".tsx", ".ts", ".md"}
SCAN_EXCLUDE    = {
    ".venv", "node_modules", ".next", "__pycache__",
    ".git", ".chromadb", "alembic/versions",
}

# ── Task execution limits ─────────────────────────────────────────────────────
MAX_RETRIES       = 3
MAX_FILE_SIZE_KB  = 500
CONTEXT_MAX_CHARS = 12_000
