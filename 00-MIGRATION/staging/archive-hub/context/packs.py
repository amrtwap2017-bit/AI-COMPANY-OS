import time
import uuid
from dataclasses import dataclass
from typing import Any

from hub.knowledge.api import neighbors
from hub.knowledge.repo_context import recent_files
from hub.knowledge.signal_context import list_adrs, list_tests, list_routes

@dataclass
class ContextPack:
    context_pack_id: str
    version: str
    created_at: float
    intent: str
    token_budget: dict[str, Any]
    sections: list[dict[str, Any]]
    sources: list[dict[str, Any]]

def build_context_pack(
    user_request: str,
    intent: str = "general",
    repo_key: str | None = None,
    graph_seed_node_id: str | None = None,
) -> ContextPack:
    sections: list[dict[str, Any]] = [
        {"name": "user_request", "priority": 100, "content": user_request, "compression": "none"},
    ]
    sources: list[dict[str, Any]] = []

    if repo_key:
        sections.append({"name": "repo_recent_files", "priority": 95, "content": recent_files(repo_key, limit=30), "compression": "none"})
        sections.append({"name": "repo_adrs", "priority": 92, "content": list_adrs(repo_key, limit=20), "compression": "none"})
        sections.append({"name": "repo_tests", "priority": 91, "content": list_tests(repo_key, limit=30), "compression": "none"})
        sections.append({"name": "repo_api_routes", "priority": 90, "content": list_routes(repo_key, limit=50), "compression": "none"})
        sources.append({"type": "repo_graph", "repo_key": repo_key})

    if graph_seed_node_id:
        g = neighbors(graph_seed_node_id, limit=50)
        sections.append({"name": "graph_context", "priority": 85, "content": g, "compression": "none"})
        sources.append({"type": "graph_node", "id": graph_seed_node_id, "repo_key": repo_key})

    return ContextPack(
        context_pack_id=str(uuid.uuid4()),
        version="1.3.0",
        created_at=time.time(),
        intent=intent,
        token_budget={"max_input_tokens": 8000},
        sections=sections,
        sources=sources,
    )
