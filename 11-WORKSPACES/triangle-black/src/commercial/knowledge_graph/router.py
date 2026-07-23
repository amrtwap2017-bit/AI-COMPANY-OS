from __future__ import annotations
import datetime
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db

router = APIRouter(prefix="/knowledge-graph", tags=["knowledge-graph"])

QDRANT_URL = "http://localhost:6333"

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _qdrant_collections():
    try:
        r = httpx.get(f"{QDRANT_URL}/collections", timeout=5)
        return r.json().get("result", {}).get("collections", [])
    except Exception:
        return []

@router.get("/overview", summary="Knowledge graph overview")
def knowledge_graph_overview(db: Session = Depends(get_db)):
    """
    Program N — Knowledge Graph.
    Returns entity counts and Qdrant vector collections.
    This is the operational knowledge graph without Neo4j.
    """
    # DB entity counts
    entities = {}
    for table in ["work_orders","assets","technicians","contracts",
                  "inventory_items","projects","leads","invoices",
                  "purchase_orders","maintenance_plans"]:
        try:
            row = db.execute(text(f"SELECT count(*) as cnt FROM {table}")).fetchone()
            entities[table] = int(row_to_dict(row).get("cnt") or 0)
        except Exception:
            entities[table] = 0

    # Qdrant vector store
    collections = _qdrant_collections()
    tb_collections = [c for c in collections if "triangle" in c.get("name","")]

    total_entities = sum(entities.values())

    return {
        "graph_type":       "Qdrant + PostgreSQL relational graph",
        "total_entities":   total_entities,
        "entity_counts":    entities,
        "vector_collections": len(tb_collections),
        "collections":      [c.get("name") for c in tb_collections],
        "status":           "operational",
        "generated_at":     datetime.datetime.utcnow().isoformat(),
    }

@router.get("/entity/{entity_type}/{entity_id}", summary="Entity relationships")
def get_entity_relationships(
    entity_type: str,
    entity_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns all relationships for a given entity.
    Traverses the operational graph from any entity type.
    """
    entity_type = entity_type.lower()
    result = {
        "entity_type": entity_type,
        "entity_id":   entity_id,
        "relationships": {},
        "generated_at": datetime.datetime.utcnow().isoformat(),
    }

    try:
        if entity_type in ("work_order", "work_orders"):
            row = db.execute(
                text("SELECT * FROM work_orders WHERE id = :id"), {"id": entity_id}
            ).fetchone()
            if row:
                wo = row_to_dict(row)
                result["entity"] = wo

                # Related asset
                if wo.get("asset_id"):
                    a = db.execute(text("SELECT id,name,category FROM assets WHERE id=:id"),
                                   {"id": wo["asset_id"]}).fetchone()
                    result["relationships"]["asset"] = row_to_dict(a)

                # Related technician
                if wo.get("technician_id"):
                    t = db.execute(text("SELECT id,name,specializations FROM technicians WHERE id=:id"),
                                   {"id": wo["technician_id"]}).fetchone()
                    result["relationships"]["technician"] = row_to_dict(t)

                # Related hotel
                if wo.get("hotel_id"):
                    h = db.execute(text("SELECT id,name FROM hotels WHERE id=:id"),
                                   {"id": wo["hotel_id"]}).fetchone()
                    result["relationships"]["hotel"] = row_to_dict(h)

        elif entity_type in ("asset", "assets"):
            row = db.execute(
                text("SELECT * FROM assets WHERE id = :id"), {"id": entity_id}
            ).fetchone()
            if row:
                asset = row_to_dict(row)
                result["entity"] = asset

                # WOs on this asset
                wos = db.execute(text("""
                    SELECT id, title, status, priority
                    FROM work_orders WHERE asset_id = :id
                    ORDER BY created_at DESC LIMIT 10
                """), {"id": entity_id}).fetchall()
                result["relationships"]["work_orders"] = [row_to_dict(w) for w in wos]

                # PM plans
                pms = db.execute(text("""
                    SELECT id, title, plan_type, next_due_date
                    FROM maintenance_plans WHERE asset_id = :id
                    LIMIT 5
                """), {"id": entity_id}).fetchall()
                result["relationships"]["maintenance_plans"] = [row_to_dict(p) for p in pms]

        elif entity_type in ("contract", "contracts"):
            row = db.execute(
                text("SELECT * FROM contracts WHERE id = :id"), {"id": entity_id}
            ).fetchone()
            if row:
                contract = row_to_dict(row)
                result["entity"] = contract

                # Hotel
                if contract.get("hotel_id"):
                    h = db.execute(text("SELECT id,name,city FROM hotels WHERE id=:id"),
                                   {"id": contract["hotel_id"]}).fetchone()
                    result["relationships"]["hotel"] = row_to_dict(h)

                # Invoices
                invs = db.execute(text("""
                    SELECT id, status, total_amount, due_date
                    FROM invoices WHERE contract_id = :id
                    LIMIT 10
                """), {"id": entity_id}).fetchall()
                result["relationships"]["invoices"] = [row_to_dict(i) for i in invs]

        elif entity_type in ("technician", "technicians"):
            row = db.execute(
                text("SELECT * FROM technicians WHERE id = :id"), {"id": entity_id}
            ).fetchone()
            if row:
                tech = row_to_dict(row)
                result["entity"] = tech

                # Active WOs
                wos = db.execute(text("""
                    SELECT id, title, status, priority, type
                    FROM work_orders
                    WHERE technician_id = :id
                      AND status NOT IN ('completed','closed','cancelled')
                    ORDER BY priority DESC LIMIT 10
                """), {"id": entity_id}).fetchall()
                result["relationships"]["active_work_orders"] = [row_to_dict(w) for w in wos]

        else:
            raise HTTPException(400, f"Unknown entity type: {entity_type}. "
                                     "Supported: work_order, asset, contract, technician")

    except HTTPException:
        raise
    except Exception as e:
        result["error"] = str(e)

    return result

@router.get("/path/{from_type}/{from_id}/{to_type}", summary="Graph path traversal")
def graph_path(
    from_type: str,
    from_id: str,
    to_type: str,
    db: Session = Depends(get_db)
):
    """
    Finds the relationship path between two entity types.
    Example: /graph/path/asset/123/technician
    Shows: asset → work_orders → technician
    """
    PATHS = {
        ("asset",      "technician"):  ["asset", "work_order", "technician"],
        ("asset",      "invoice"):     ["asset", "work_order", "contract", "invoice"],
        ("contract",   "asset"):       ["contract", "hotel", "asset"],
        ("technician", "inventory"):   ["technician", "work_order", "inventory_item"],
        ("hotel",      "invoice"):     ["hotel", "contract", "invoice"],
        ("lead",       "invoice"):     ["lead", "contract", "project", "invoice"],
    }

    key = (from_type.lower(), to_type.lower())
    path = PATHS.get(key, [from_type, "...", to_type])

    return {
        "from":  {"type": from_type, "id": from_id},
        "to":    {"type": to_type},
        "path":  path,
        "hops":  len(path) - 1,
        "description": " → ".join(path),
        "note":  "Full graph traversal available in Program N Phase 2 (Neo4j)",
    }

@router.get("/stats", summary="Graph statistics")
def graph_stats(db: Session = Depends(get_db)):
    """Total entity count + relationship density across all tables."""
    stats = {}
    tables = [
        "work_orders", "assets", "technicians", "maintenance_plans",
        "purchase_orders", "inventory_items", "contracts", "leads",
        "invoices", "projects", "rfqs", "hotels", "sites",
        "service_requests", "goods_receipts",
    ]
    total = 0
    for t in tables:
        try:
            row = db.execute(text(f"SELECT count(*) as n FROM {t}")).fetchone()
            n = int(row_to_dict(row).get("n") or 0)
            stats[t] = n
            total += n
        except Exception:
            pass

    collections = _qdrant_collections()
    vector_count = 0
    for c in collections:
        try:
            r = httpx.get(f"{QDRANT_URL}/collections/{c['name']}", timeout=3)
            vc = r.json().get("result",{}).get("points_count", 0)
            vector_count += vc
        except Exception:
            pass

    return {
        "total_entities":       total,
        "entity_breakdown":     stats,
        "vector_embeddings":    vector_count,
        "qdrant_collections":   len(collections),
        "graph_density":        "relational",
        "knowledge_engine":     "Qdrant + PostgreSQL",
        "generated_at":         datetime.datetime.utcnow().isoformat(),
    }
