"""
Prompt Loader
─────────────────────────────────────────────────────
Loads agent system prompts from markdown files.
Caches in memory for performance.
Falls back to registry description if file missing.
"""

from pathlib import Path
from functools import lru_cache

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


@lru_cache(maxsize=50)
def load_prompt(agent_name: str) -> str:
    """
    Load prompt for an agent from its markdown file.
    Cached after first load.
    Returns empty string if file not found.
    """
    prompt_file = PROMPTS_DIR / f"{agent_name}.md"
    if prompt_file.exists():
        return prompt_file.read_text(encoding="utf-8").strip()
    return ""


def load_prompt_with_fallback(
    agent_name: str,
    fallback_description: str = "",
) -> str:
    """
    Load prompt with fallback to description.
    """
    prompt = load_prompt(agent_name)
    if prompt:
        return prompt
    return f"You are {agent_name}. {fallback_description}"


def reload_prompt(agent_name: str) -> str:
    """
    Force reload a prompt (clears cache for this agent).
    """
    load_prompt.cache_clear()
    return load_prompt(agent_name)


def list_available_prompts() -> list[str]:
    """List all agents that have prompt files."""
    return [
        f.stem
        for f in PROMPTS_DIR.glob("*.md")
        if f.is_file()
    ]


def prompt_stats() -> dict:
    """Return stats about the prompt system."""
    available = list_available_prompts()
    return {
        "total_prompts": len(available),
        "agents_with_prompts": available,
        "prompts_dir": str(PROMPTS_DIR),
    }
