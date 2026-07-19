import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select, or_

from hub.db.engine import engine
from hub.knowledge.graph_models import GraphNode, GraphEdge

def upsert_node(node_type: str, key: str, props: dict) -> dict:
    with Session(engine) as s:
        existing = s.execute(
            select(GraphNode).where(GraphNode.type == node_type, GraphNode.key == key)
        ).scalar_one_or_none()

        if existing:
            existing.props = props
            s.commit()
            return {"id": existing.id, "type": existing.type, "key": existing.key, "props": existing.props}

        node_id = str(uuid.uuid4())
        n = GraphNode(id=node_id, type=node_type, key=key, props=props)
        s.add(n)
        s.commit()
        return {"id": n.id, "type": n.type, "key": n.key, "props": n.props}

def upsert_edge(from_id: str, to_id: str, edge_type: str, props: dict) -> dict:
    with Session(engine) as s:
        edge_id = str(uuid.uuid4())
        e = GraphEdge(id=edge_id, from_id=from_id, to_id=to_id, type=edge_type, props=props)
        s.add(e)
        s.commit()
        return {"id": e.id, "from_id": e.from_id, "to_id": e.to_id, "type": e.type, "props": e.props}

def neighbors(node_id: str, limit: int = 50) -> dict:
    with Session(engine) as s:
        edges = s.execute(
            select(GraphEdge).where(or_(GraphEdge.from_id == node_id, GraphEdge.to_id == node_id)).limit(limit)
        ).scalars().all()

        neighbor_ids = set()
        for e in edges:
            neighbor_ids.add(e.from_id)
            neighbor_ids.add(e.to_id)
        neighbor_ids.discard(node_id)

        nodes = []
        if neighbor_ids:
            nodes = s.execute(select(GraphNode).where(GraphNode.id.in_(neighbor_ids))).scalars().all()

        return {
            "node_id": node_id,
            "edges": [{"id": e.id, "from_id": e.from_id, "to_id": e.to_id, "type": e.type, "props": e.props} for e in edges],
            "neighbors": [{"id": n.id, "type": n.type, "key": n.key, "props": n.props} for n in nodes],
        }
