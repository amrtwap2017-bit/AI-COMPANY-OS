import re
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select

from hub.db.engine import engine
from hub.knowledge.graph_models import GraphNode, GraphEdge

ROUTE_DECORATOR_RE = re.compile(r'@app\.(get|post|put|delete|patch)\(\s*<!--citation:1-->["\']', re.IGNORECASE)

def _upsert_node(s: Session, node_type: str, key: str, props: dict) -> GraphNode:
    existing = s.execute(select(GraphNode).where(GraphNode.type == node_type, GraphNode.key == key)).scalar_one_or_none()
    if existing:
        existing.props = props
        return existing
    n = GraphNode(id=str(uuid.uuid4()), type=node_type, key=key, props=props)
    s.add(n)
    return n

def _add_edge(s: Session, from_id: str, to_id: str, edge_type: str, props: dict) -> None:
    s.add(GraphEdge(id=str(uuid.uuid4()), from_id=from_id, to_id=to_id, type=edge_type, props=props))

def _file_nodes_for_repo(s: Session, repo_key: str) -> list[GraphNode]:
    prefix = repo_key + ":"
    return s.execute(
        select(GraphNode).where(GraphNode.type == "file").where(GraphNode.key.startswith(prefix))
    ).scalars().all()

def index_signals(repo_key: str, root: str) -> dict:
    prefix = repo_key + ":"
    indexed = {"adrs": 0, "tests": 0, "routes": 0}

    with Session(engine) as s:
        file_nodes = _file_nodes_for_repo(s, repo_key)

        for fn in file_nodes:
            path = fn.key[len(prefix):]
            props = fn.props or {}

            # ADR detection
            is_adr = ("/adr/" in path.lower()) or path.lower().endswith(".md") and ("adr" in path.lower())
            if is_adr:
                adr_key = f"{repo_key}:adr:{path}"
                adr = _upsert_node(s, "adr", adr_key, {"path": path})
                _add_edge(s, adr.id, fn.id, "DERIVED_FROM", {"kind": "adr"})
                indexed["adrs"] += 1

            # Test detection
            lower = path.lower()
            is_test = ("/tests/" in lower) or (lower.startswith("tests/")) or ("/test_" in lower) or (lower.endswith("_test.py")) or (lower.startswith("test_") and lower.endswith(".py"))
            if is_test:
                test_key = f"{repo_key}:test:{path}"
                tn = _upsert_node(s, "test", test_key, {"path": path})
                _add_edge(s, tn.id, fn.id, "DERIVED_FROM", {"kind": "test"})
                indexed["tests"] += 1

            # FastAPI route extraction (only from smallish python files)
            if path.endswith(".py") and props.get("size", 0) <= 400_000:
                abs_path = root.rstrip("/") + "/" + path
                try:
                    text = open(abs_path, "r", encoding="utf-8", errors="ignore").read()
                except Exception:
                    continue
                for m in ROUTE_DECORATOR_RE.finditer(text):
                    method = m.group(1).upper()
                    route = m.group(2)
                    route_key = f"{repo_key}:route:{method}:{route}"
                    rn = _upsert_node(s, "api_route", route_key, {"method": method, "path": route, "source_file": path})
                    _add_edge(s, rn.id, fn.id, "DERIVED_FROM", {"kind": "api_route"})
                    indexed["routes"] += 1

        s.commit()
        return {"ok": True, "repo_key": repo_key, "indexed": indexed}
