"""
AI Sprint Planner — uses Ollama to generate sprint tasks from workspace exploration.
Reads Hub memory (exploration findings) and creates concrete actionable tasks.
"""
import json
import httpx
from src import hub_client
from src.settings import OLLAMA_BASE_URL, MODELS


PLANNER_SYSTEM_PROMPT = """You are a senior engineering lead planning a sprint for a software project.

You will receive an exploration report about a codebase and must generate concrete, actionable sprint tasks.

RULES:
1. Return ONLY valid JSON — no markdown, no explanation
2. Generate 6-12 tasks maximum
3. Each task must be immediately executable by an AI code generator
4. Tasks must be ordered by priority (critical first)
5. Each task needs clear acceptance criteria (3-5 items)
6. Task types: code | architecture | test | fix

JSON format:
{
  "sprint_name": "Sprint N — <theme>",
  "goal": "<one sentence goal>",
  "tasks": [
    {
      "title": "TASK-001: <specific title>",
      "description": "<what to build, specific files, specific endpoints>",
      "type": "code",
      "priority": "critical|high|medium|low",
      "acceptance_criteria": [
        "<specific, testable criterion>",
        "<specific, testable criterion>"
      ],
      "estimated_files": ["src/path/to/file.py"]
    }
  ]
}"""


def _call_ollama_planner(prompt: str, model: str = None) -> str:
    """Call Ollama for planning — uses reasoning model."""
    model = model or MODELS["general"]
    try:
        r = httpx.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": PLANNER_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                "stream": False,
                "options": {"temperature": 0.2, "num_predict": 4096, "num_ctx": 8192},
            },
            timeout=300,
        )
        r.raise_for_status()
        return r.json()["message"]["content"].strip()
    except Exception as e:
        return f'{{"error": "{str(e)[:100]}"}}'


def _extract_plan(raw: str) -> dict:
    """Extract JSON plan from Ollama output."""
    raw = raw.strip()

    # Strip markdown
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

    try:
        return json.loads(raw)
    except Exception:
        # Find JSON
        brace = raw.find("{")
        if brace != -1:
            try:
                return json.loads(raw[brace:])
            except Exception:
                pass
    return {"tasks": [], "error": "Could not parse plan"}


def build_planning_prompt(
    workspace_id: str,
    workspace_root: str,
    exploration: dict,
    epic: str = "",
    extra_context: str = "",
) -> str:
    """Build the planning prompt from exploration results."""
    issues = exploration.get("issues", [])
    missing = exploration.get("missing", [])
    strengths = exploration.get("strengths", [])
    todos = exploration.get("todos", [])
    python_info = exploration.get("python", {})
    test_info = exploration.get("tests", {})
    db_info = exploration.get("database", {})
    git_info = exploration.get("git", {})
    api_info = exploration.get("api", {})

    modules = python_info.get("commercial_modules", [])
    incomplete = [m for m in modules if not m["complete"]]
    complete = [m for m in modules if m["complete"]]

    prompt = f"""WORKSPACE EXPLORATION REPORT
============================
Workspace: {workspace_root}
Scanned: {exploration.get('scanned_at', 'unknown')}
Health Score: {exploration.get('summary', {}).get('health_score', 0)}/100

GIT STATE:
- Branch: {git_info.get('branch', 'unknown')}
- Last commit: {git_info.get('last_commit', 'unknown')}
- Recent: {git_info.get('recent_commits', '')[:200]}

PYTHON CODEBASE:
- Total files: {python_info.get('total_files', 0)}
- Complete modules ({len(complete)}): {', '.join(m['name'] for m in complete[:10])}
- Incomplete modules ({len(incomplete)}): {', '.join(f"{m['name']} (missing: {m['missing']})" for m in incomplete[:5])}

TESTS:
- Test files: {test_info.get('test_files', 0)}
- Tests collected: {test_info.get('tests_collected', 0)}
- Collection errors: {test_info.get('collection_errors', 0)}

DATABASE:
- Connected: {db_info.get('connected', False)}
- Tables: {list(db_info.get('tables', {}).keys())[:15]}

API:
- Routers registered: {api_info.get('routers_registered', 0)}
- Health endpoint: {api_info.get('has_health', False)}

ISSUES FOUND ({len(issues)}):
{chr(10).join(f'- {i}' for i in issues[:10])}

MISSING ({len(missing)}):
{chr(10).join(f'- {m}' for m in missing[:10])}

TODOS IN CODE ({len(todos)}):
{chr(10).join(f'- {t}' for t in todos[:5])}

STRENGTHS ({len(strengths)}):
{chr(10).join(f'- {s}' for s in strengths[:5])}
"""

    if epic:
        prompt += f"\n\nEPIC TO IMPLEMENT:\n{epic}\n"

    if extra_context:
        prompt += f"\n\nADDITIONAL CONTEXT:\n{extra_context}\n"

    prompt += """
TASK:
Based on this exploration report, generate a focused sprint plan.
Prioritize:
1. Fixing critical issues (syntax errors, collection errors, broken imports)
2. Completing incomplete modules
3. Adding missing tests
4. Implementing the epic (if provided)
5. Performance and quality improvements

Generate 6-12 specific, immediately actionable tasks.
Each task description must specify exact files to create/modify.
"""

    return prompt


def plan_sprint(
    workspace_id: str,
    workspace_root: str,
    exploration: dict,
    epic: str = "",
    extra_context: str = "",
    model: str = None,
) -> dict:
    """
    Generate a sprint plan from workspace exploration.
    Returns structured plan with tasks ready to create in Hub.
    """
    prompt = build_planning_prompt(
        workspace_id=workspace_id,
        workspace_root=workspace_root,
        exploration=exploration,
        epic=epic,
        extra_context=extra_context,
    )

    raw = _call_ollama_planner(prompt, model=model)
    plan = _extract_plan(raw)

    return plan


def create_tasks_from_plan(workspace_id: str, plan: dict) -> list[str]:
    """
    Create Hub tasks from a sprint plan.
    Returns list of created task IDs.
    """
    created_ids = []
    tasks = plan.get("tasks", [])

    for task in tasks:
        result = hub_client.create_task(
            workspace_id=workspace_id,
            title=task.get("title", "Untitled Task"),
            description=task.get("description", ""),
            task_type=task.get("type", "code"),
            priority=task.get("priority", "medium"),
            acceptance_criteria=task.get("acceptance_criteria", []),
        )
        if result and result.get("id"):
            created_ids.append(result["id"])

    return created_ids
