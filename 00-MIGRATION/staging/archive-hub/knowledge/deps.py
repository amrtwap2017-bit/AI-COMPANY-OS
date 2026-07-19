import ast
import uuid
from pathlib import Path
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

def _add_edge(s: Session, from_id: str, to_id: str, edge_type: str, props: dict) -> None:
    s.add(GraphEdge(id=str(uuid.uuid4()), from_id=from_id, to_id=to_id, type=edge_type, props=props))

def _file_nodes(s: Session, repo_key: str) -> list[GraphNode]:
    prefix = repo_key + ":"
    return s.execute(
        select(GraphNode).where(GraphNode.type == "file").where(GraphNode.key.startswith(prefix))
    ).scalars().all()

def _module_name_from_path(repo_root: str, rel_path: str) -> str | None:
    # crude v1: only for python files under repo
    if not rel_path.endswith(".py"):
        return None
    # drop .py and replace / with .
    mod = rel_path[:-3].replace("/", ".")
    # remove trailing .__init__
    if mod.endswith(".__init__"):
        mod = mod[: -len(".__init__")]
    return mod

def _parse_imports(py_text: str) -> set[str]:
    out: set[str] = set()
    try:
        tree = ast.parse(py_text)
    except Exception:
        return out
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for n in node.names:
                if n.name:
                    out.add(n.name)
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                out.add(node.module)
    return out

def index_python_deps(repo_key: str, repo_root: str) -> dict:
    prefix = repo_key + ":"
    repo_root = str(Path(repo_root).resolve())

    indexed_modules = 0
    indexed_edges = 0

    with Session(engine) as s:
        files = _file_nodes(s, repo_key)

        for fn in files:
            rel_path = fn.key[len(prefix):]
            if not rel_path.endswith(".py"):
                continue

            abs_path = str(Path(repo_root) / rel_path)
            try:
                text = open(abs_path, "r", encoding="utf-8", errors="ignore").read()
            except Exception:
                continue

            module_name = _module_name_from_path(repo_root, rel_path)
            if not module_name:
                continue

            mnode = _upsert_node(s, "py_module", f"{repo_key}:py:{module_name}", {"module": module_name, "path": rel_path})
            indexed_modules += 1
            s.flush()

            imports = _parse_imports(text)
            for imp in sorted(imports):
                inode = _upsert_node(s, "py_module", f"{repo_key}:py:{imp}", {"module": imp})
                s.flush()
                _add_edge(s, mnode.id, inode.id, "IMPORTS", {"repo_key": repo_key})
                indexed_edges += 1

        s.commit()
        return {"ok": True, "repo_key": repo_key, "modules": indexed_modules, "import_edges": indexed_edges}
