"""HTTP client for AI Engineering Hub (port 8010)."""
import httpx
from src.settings import HUB_BASE_URL

TIMEOUT = 600.0

def _post(path: str, body: dict) -> dict:
    try:
        r = httpx.post(f"{HUB_BASE_URL}{path}", json=body, timeout=TIMEOUT)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return {"ok": False, "error": str(e)}

def _get(path: str, params: dict | None = None) -> dict | list:
    try:
        r = httpx.get(f"{HUB_BASE_URL}{path}", params=params or {}, timeout=30)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return {"ok": False, "error": str(e)}

# Tasks
def get_task(task_id: str) -> dict:
    return _get(f"/tasks/{task_id}")

def list_tasks(workspace_id: str, status: str = "") -> list:
    result = _get(f"/workspaces/{workspace_id}/tasks", {"status": status})
    return result if isinstance(result, list) else []

def create_task(workspace_id: str, title: str, description: str = "",
                task_type: str = "code", priority: str = "medium",
                acceptance_criteria: list | None = None) -> dict:
    """Create a task in the Hub. Maps task_type to the 'type' field."""
    return _post("/tasks", {
        "workspace_id": workspace_id,
        "title": title,
        "description": description,
        "type": task_type,
        "priority": priority,
        "status": "pending",
        "acceptance_criteria": acceptance_criteria or [],
    })

def execute_code_task(task_id: str, workspace_id: str, workspace_root: str) -> dict:
    return _post(f"/tasks/{task_id}/execute_code", {
        "workspace_id": workspace_id,
        "actor_id": "orchestrator",
        "workspace_root": workspace_root,
    })

def orchestrate_task(task_id: str) -> dict:
    return _post(f"/tasks/{task_id}/orchestrate", {})

# Memory
def remember(workspace_id: str, memory_type: str, subject: str,
             content: str, run_group: str = "") -> dict:
    return _post("/memory", {
        "workspace_id": workspace_id,
        "memory_type": memory_type,
        "subject": subject,
        "content": content,
        "run_group": run_group,
    })

def recall(workspace_id: str, memory_type: str = "") -> list:
    result = _get("/memory", {"workspace_id": workspace_id, "type": memory_type})
    return result if isinstance(result, list) else []

# Workspace
def get_workspace(workspace_id: str) -> dict:
    return _get(f"/workspaces/{workspace_id}")

# Knowledge
def index_repo(repo_key: str, local_path: str) -> dict:
    return _post("/knowledge/index_repo", {"repo_key": repo_key, "local_path": local_path})
