from sqlalchemy.orm import Session
from sqlalchemy import select
from hub.db.engine import engine
from hub.knowledge.graph_models import GraphNode, GraphEdge

def impact_by_file(repo_key: str, file_path: str, limit: int = 200) -> dict:
    # file_path is repo-relative
    module = file_path
    if module.endswith(".py"):
        module = module[:-3].replace("/", ".")
        if module.endswith(".__init__"):
            module = module[: -len(".__init__")]

    module_key = f"{repo_key}:py:{module}"

    with Session(engine) as s:
        target = s.execute(
            select(GraphNode).where(GraphNode.type == "py_module").where(GraphNode.key == module_key)
        ).scalar_one_or_none()
        if not target:
            return {"ok": False, "error": "module_not_found", "module_key": module_key}

        # find reverse IMPORTS edges (who imports this module)
        edges = s.execute(
            select(GraphEdge).where(GraphEdge.type == "IMPORTS").where(GraphEdge.to_id == target.id).limit(limit)
        ).scalars().all()

        from_ids = [e.from_id for e in edges]
        if not from_ids:
            return {"ok": True, "module_key": module_key, "impacted_modules": []}

        nodes = s.execute(select(GraphNode).where(GraphNode.id.in_(from_ids))).scalars().all()
        impacted = []
        for n in nodes:
            impacted.append({"module": (n.props or {}).get("module"), "path": (n.props or {}).get("path"), "key": n.key})

        return {"ok": True, "module_key": module_key, "impacted_modules": impacted}
