"""
TB Agent — LLM interface
Wraps Ollama with streaming, retries, and model routing.
"""
from __future__ import annotations
import ollama
from rich.console import Console
from rich.markup import escape
from .config import PLANNER_MODEL, CODER_MODEL, REVIEWER_MODEL, OLLAMA_HOST

console = Console()


def _call(model: str, prompt: str, system: str = "", stream: bool = True) -> str:
    """Call Ollama model. Returns full response string."""
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    client = ollama.Client(host=OLLAMA_HOST)
    full = ""

    if stream:
        for chunk in client.chat(model=model, messages=messages, stream=True):
            text = chunk["message"]["content"]
            print(text, end="", flush=True)
            full += text
        print()
    else:
        resp = client.chat(model=model, messages=messages, stream=False)
        full = resp["message"]["content"]

    return full


def plan(prompt: str) -> str:
    """Use deepseek-r1 for planning and reasoning."""
    console.rule(f"[bold blue]PLANNER ({PLANNER_MODEL})")
    return _call(
        PLANNER_MODEL,
        prompt,
        system=(
            "You are an expert software architect analyzing the Triangle Black "
            "hotel engineering platform (FastAPI + Next.js + PostgreSQL). "
            "Be precise, structured, and actionable. "
            "When listing tasks, number them clearly."
        ),
        stream=True,
    )


def code(prompt: str) -> str:
    """Use qwen2.5-coder for code generation."""
    console.rule(f"[bold green]CODER ({CODER_MODEL})")
    return _call(
        CODER_MODEL,
        prompt,
        system=(
            "You are an expert Python and TypeScript developer. "
            "Write complete, production-ready code. "
            "Never write stubs or TODO comments. "
            "Return ONLY the code, no explanation before or after. "
            "For Python: follow existing patterns in src/commercial/. "
            "For TypeScript/TSX: use Tailwind CSS, match existing Navy #1B2B4B theme."
        ),
        stream=True,
    )


def review(prompt: str) -> str:
    """Use qwen3.5 for fast review."""
    return _call(REVIEWER_MODEL, prompt, stream=False)


def embed(texts: list[str]) -> list[list[float]]:
    """Generate embeddings using nomic-embed-text."""
    client = ollama.Client(host=OLLAMA_HOST)
    results = []
    for text in texts:
        resp = client.embeddings(model="nomic-embed-text", prompt=text[:2000])
        results.append(resp["embedding"])
    return results
