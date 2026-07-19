from sqlalchemy.orm import Session
from sqlalchemy import select
from hub.db.engine import engine
from hub.knowledge.graph_models import GraphNode

def _by_prefix(node_type: str, prefix: str, limit: int) -> list[GraphNode]:
    with Session(engine) as s:
        rows = s.execute(
            select(GraphNode)
            .where(GraphNode.type == node_type)
            .where(GraphNode.key.startswith(prefix))
            .limit(limit)
        ).scalars().all()
    return rows

def list_adrs(repo_key: str, limit: int = 20) -> list[dict]:
    prefix = f"{repo_key}:adr:"
    rows = _by_prefix("adr", prefix, limit)
    return [{"path": (r.props or {}).get("path"), "key": r.key} for r in rows]

def list_tests(repo_key: str, limit: int = 30) -> list[dict]:
    prefix = f"{repo_key}:test:"
    rows = _by_prefix("test", prefix, limit)
    return [{"path": (r.props or {}).get("path"), "key": r.key} for r in rows]

def list_routes(repo_key: str, limit: int = 50) -> list[dict]:
    prefix = f"{repo_key}:route:"
    rows = _by_prefix("api_route", prefix, limit)
    out = []
    for r in rows:
        p = r.props or {}
        out.append({"method": p.get("method"), "path": p.get("path"), "source_file": p.get("source_file")})
    return out
