"""Planning engine — decompose tasks using Ollama."""
import json
import httpx
import os

OLLAMA_BASE = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")

def decompose_task(title: str, description: str = "",
                   acceptance_criteria: list = None,
                   workspace_id: str = "") -> list:
    """Use Ollama to decompose a feature into subtasks."""
    criteria_text = "\n".join(f"- {c}" for c in (acceptance_criteria or []))
    prompt = f"""Decompose this engineering task into 3-7 concrete subtasks.

TASK: {title}
DESCRIPTION: {description}
ACCEPTANCE CRITERIA:
{criteria_text}

Return ONLY valid JSON array:
[
  {{"title": "...", "description": "...", "type": "task",
    "acceptance_criteria": ["...", "..."]}},
  ...
]

Each subtask must be specific, actionable, and independently implementable.
No markdown, no explanation — only the JSON array."""

    try:
        resp = httpx.post(
            f"{OLLAMA_BASE}/api/chat",
            json={
                "model": "deepseek-r1:8b",
                "messages": [
                    {"role": "system", "content": "You are an engineering planning assistant. Return only valid JSON."},
                    {"role": "user", "content": prompt},
                ],
                "stream": False,
                "options": {"temperature": 0.1, "num_predict": 2048},
            },
            timeout=120,
        )
        raw = resp.json()["message"]["content"].strip()

        # Strip markdown fences
        if "```" in raw:
            lines = raw.split("\n")
            inner, in_block = [], False
            for line in lines:
                if line.strip().startswith("```") and not in_block:
                    in_block = True
                    continue
                if line.strip() == "```" and in_block:
                    break
                if in_block:
                    inner.append(line)
            raw = "\n".join(inner).strip()

        bracket = raw.find("[")
        if bracket != -1:
            result = json.loads(raw[bracket:])
            if isinstance(result, list):
                return result

    except Exception as e:
        pass

    # Fallback: return 3 generic subtasks
    return [
        {"title": f"Design data model for {title}", "description": "Define entities, relationships, and DB schema",
         "type": "task", "acceptance_criteria": ["Model defined", "Migration created"]},
        {"title": f"Implement API for {title}", "description": "Build FastAPI router with CRUD endpoints",
         "type": "task", "acceptance_criteria": ["All CRUD endpoints working", "Auth required"]},
        {"title": f"Write tests for {title}", "description": "Pytest tests covering all endpoints",
         "type": "task", "acceptance_criteria": ["All tests pass", "Edge cases covered"]},
    ]
