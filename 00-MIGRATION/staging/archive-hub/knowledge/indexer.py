import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select

from hub.db.engine import engine
from hub.knowledge.graph_models import GraphNode, GraphEdge

def _upsert_node(s: Session, node_type: str, key: str, props: dict) -> GraphNode:
    existing = s.execute(select(GraphNode).where(GraphNode.type == node_type, GraphNode.key == key)).scalar_one_or_none()
    if existing:
        existing.props = props
        return existing
    n = GraphNode(id=str(uuid.uuid4()), type=node_type, key=key, props=props)
    s.add(n)
    return n

def _ensure_edge(s: Session, from_id: str, to_id: str, edge_type: str, props: dict) -> None:
    # simple: allow duplicates for now; can add unique constraint later
    e = GraphEdge(id=str(uuid.uuid4()), from_id=from_id, to_id=to_id, type=edge_type, props=props)
    s.add(e)

def index_repo_inventory(repo_key: str, inventory: dict) -> dict:
    root = inventory.get("root")
    files = inventory.get("files", [])

    with Session(engine) as s:
        repo_node = _upsert_node(s, "repo", repo_key, {"root": root, "count": inventory.get("count"), "truncated": inventory.get("truncated")})
        s.flush()

        indexed = 0
        for f in files:
            path = f["path"]
            file_key = f"{repo_key}:{path}"
            file_node = _upsert_node(s, "file", file_key, f)
            s.flush()
            _ensure_edge(s, repo_node.id, file_node.id, "CONTAINS", {"path": path})
            indexed += 1

        s.commit()
        return {"ok": True, "repo_key": repo_key, "indexed_files": indexed, "repo_node_id": repo_node.id}
