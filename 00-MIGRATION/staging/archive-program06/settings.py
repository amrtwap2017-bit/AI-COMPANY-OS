"""Orchestrator settings."""
import os

POSTGRES_DSN = os.environ.get(
    "POSTGRES_DSN",
    "postgresql+psycopg://postgres:postgres@127.0.0.1:55432/ai_hub"
)
HUB_BASE_URL = os.environ.get("HUB_BASE_URL", "http://127.0.0.1:8010")
AICOS_BASE_URL = os.environ.get("AI_COMPANY_OS_BASE_URL", "http://127.0.0.1:8000")
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
REDIS_URL = os.environ.get("REDIS_URL", "redis://127.0.0.1:56379")
QDRANT_URL = os.environ.get("QDRANT_URL", "http://127.0.0.1:6333")
ORCHESTRATOR_PORT = int(os.environ.get("ORCHESTRATOR_PORT", "8020"))

TB_WORKSPACE_ID = "0d22ba37-30b0-46d9-844f-312ec5f9abc8"
TB_WORKSPACE_ROOT = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black"

# Model assignments
MODELS = {
    "planning":     "deepseek-r1:8b",
    "architecture": "deepseek-r1:8b",
    "coding":       "qwen2.5-coder:7b",
    "review":       "qwen3.5:4b",
    "fast":         "llama3.2:3b",
    "general":      "qwen3.5:4b",
}

REVIEW_PASS_THRESHOLD = 80
MAX_FIX_ATTEMPTS = 3
