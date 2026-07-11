"""
TB Agent LLM Client — wraps Ollama API directly
"""
from __future__ import annotations
import json
import urllib.request
import urllib.error


OLLAMA_BASE = "http://localhost:11434"
PLAN_MODEL  = "qwen2.5-coder:7b"
CODE_MODEL  = "qwen2.5-coder:7b"


def _ollama_generate(model: str, prompt: str, timeout: int = 120) -> str:
    """Call Ollama /api/generate and return the full response text."""
    payload = json.dumps({
        "model":  model,
        "prompt": prompt,
        "stream": False,
    }).encode()

    req = urllib.request.Request(
        f"{OLLAMA_BASE}/api/generate",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read())
            return data.get("response", "").strip()
    except urllib.error.URLError as e:
        return f"❌ Ollama not reachable: {e}"
    except Exception as e:
        return f"❌ LLM error: {e}"


class OllamaClient:
    """Simple Ollama wrapper used by TB Agent commands."""

    def plan(self, prompt: str) -> str:
        """Use planning model (deepseek-r1) for analysis and reasoning."""
        return _ollama_generate(PLAN_MODEL, prompt)

    def code(self, prompt: str) -> str:
        """Use coding model (qwen2.5-coder) for code generation."""
        return _ollama_generate(CODE_MODEL, prompt)

    def ask(self, question: str) -> str:
        """Ask either model a question — uses planning model."""
        return _ollama_generate(PLAN_MODEL, question)

    def is_available(self) -> bool:
        """Check if Ollama is reachable."""
        try:
            with urllib.request.urlopen(
                f"{OLLAMA_BASE}/api/tags", timeout=3
            ) as resp:
                return resp.status == 200
        except Exception:
            return False

    def list_models(self) -> list[str]:
        """Return list of available model names."""
        try:
            with urllib.request.urlopen(
                f"{OLLAMA_BASE}/api/tags", timeout=3
            ) as resp:
                data = json.loads(resp.read())
                return [m["name"] for m in data.get("models", [])]
        except Exception:
            return []
