import os
from pathlib import Path
from hub.core.loader import resolve_path

class PromptEngine:
    """Manages AI persona and instruction sets for the Hub."""
    
    def __init__(self):
        self.prompt_dir = Path(resolve_path("20-KNOWLEDGE/prompts"))
        self.prompt_dir.mkdir(parents=True, exist_ok=True)

    def get_prompt(self, name: str) -> str:
        path = self.prompt_dir / f"{name}.md"
        if not path.exists():
            return self._default_prompt(name)
        return path.read_text()

    def _default_prompt(self, name: str) -> str:
        defaults = {
            "architect": "You are the Triangle Black Lead Architect. Focus on MEP, Maintenance, and B2B Hospitality Supply Chain logic.",
            "developer": "You are a Senior Engineer. Follow Clean Architecture. Ensure workspace isolation using workspace_id.",
            "reviewer": "Verify code against Enterprise standards: Security, Performance, and Documentation."
        }
        return defaults.get(name, "You are an AI Assistant for Triangle Black.")

prompt_engine = PromptEngine()