"""Knowledge Synchronizer — keeps graph fresh after every commit."""
from src import hub_client
from src.settings import TB_WORKSPACE_ROOT


def sync_after_commit(workspace_id: str, workspace_root: str = "") -> dict:
    """Trigger full re-index of workspace into knowledge graph."""
    workspace_root = workspace_root or TB_WORKSPACE_ROOT
    repo_key = f"triangle-black:{workspace_root}"
    result = hub_client.index_repo(repo_key, workspace_root)
    return {"ok": True, "repo_key": repo_key, "index_result": result}


def sync_on_startup(workspace_id: str, workspace_root: str = "") -> dict:
    """Full sync on orchestrator startup."""
    return sync_after_commit(workspace_id, workspace_root)
