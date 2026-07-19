from sqlalchemy.orm import Session
from sqlalchemy import select
from hub.db.engine import engine
from hub.knowledge.graph_models import GraphNode

def recent_files(repo_key: str, limit: int = 30) -> list[dict]:
    prefix = repo_key + ":"
    with Session(engine) as s:
        rows = s.execute(
            select(GraphNode)
            .where(GraphNode.type == "file")
            .where(GraphNode.key.startswith(prefix))
        ).scalars().all()

    def mtime(n: GraphNode) -> int:
        try:
            return int((n.props or {}).get("mtime", 0))
        except Exception:
            return 0

    rows = sorted(rows, key=mtime, reverse=True)[:limit]
    out = []
    for n in rows:
        props = n.props or {}
        out.append({
            "path": n.key[len(prefix):],
            "size": props.get("size"),
            "mtime": props.get("mtime"),
            "sha256": props.get("sha256"),
        })
    return out
