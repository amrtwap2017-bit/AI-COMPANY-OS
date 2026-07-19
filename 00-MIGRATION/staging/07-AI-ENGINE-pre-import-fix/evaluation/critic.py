"""
Critic Agent — handles both plain and markdown bold headers
"""

import re
from dataclasses import dataclass
from app.services.ollama import ollama_service

EVAL_MODELS_PRIORITY = [
    "deepseek-r1:8b",
    "qwen3.5:4b",
    "llama3.2:3b",
]


def _pick_model() -> str:
    installed = ollama_service.list_models()
    for model in EVAL_MODELS_PRIORITY:
        if model in installed:
            return model
    return installed[0] if installed else "llama3.2:3b"


@dataclass
class CritiqueResult:
    summary: str
    what_worked: str
    what_failed: str
    improvements: str
    recommendation: str


class CriticAgent:

    def critique(
        self,
        goal: str,
        final_output: str,
        task_results: dict | None = None,
    ) -> CritiqueResult:

        model = _pick_model()

        context = ""
        if task_results:
            lines = []
            for task_id, result in task_results.items():
                status = result.get("status", "unknown")
                task_name = result.get("task", task_id)
                lines.append(f"- {task_name}: {status}")
            context = "Tasks executed:\n" + "\n".join(lines)

        system = """You are a senior AI Output Critic.
Provide honest, constructive critique of AI project outputs.
Be specific. Be direct.

You MUST use these exact plain text headers (no bold, no markdown):
SUMMARY: your text here
WHAT WORKED: your text here
WHAT FAILED: your text here
IMPROVEMENTS: your text here
RECOMMENDATION: accept or revise or reject, and why
"""

        prompt = f"""Critique this project output:

PROJECT GOAL: {goal}

{context}

FINAL OUTPUT:
{final_output[:2000]}

Use plain text headers exactly as shown. No bold formatting."""

        response = ollama_service.generate(
            model=model,
            prompt=prompt,
            system=system,
        )

        return self._parse_critique(response)

    def _parse_critique(self, response: str) -> CritiqueResult:

        def extract(label: str) -> str:
            # Match both plain and bold markdown headers
            patterns = [
                rf'\*\*{label}\*\*:?\s*(.+?)(?=\n\*\*[A-Z]|\n[A-Z]{{2,}}:|$)',
                rf'{label}:?\s*(.+?)(?=\n[A-Z]{{2,}}:|\n\*\*[A-Z]|$)',
            ]
            for pattern in patterns:
                match = re.search(pattern, response, re.DOTALL | re.IGNORECASE)
                if match:
                    return match.group(1).strip()
            return ""

        summary       = extract("SUMMARY")
        what_worked   = extract("WHAT WORKED")
        what_failed   = extract("WHAT FAILED")
        improvements  = extract("IMPROVEMENTS")
        recommendation = extract("RECOMMENDATION")

        # Fallback — use first 200 chars if nothing parsed
        if not summary:
            summary = response[:200].strip()

        return CritiqueResult(
            summary=summary,
            what_worked=what_worked,
            what_failed=what_failed,
            improvements=improvements,
            recommendation=recommendation,
        )


critic_agent = CriticAgent()
