from __future__ import annotations
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db

router = APIRouter(prefix="/twin", tags=["digital-twin"])

def _safe_int(val):
    try:
        return int(val or 0)
    except Exception:
        return 0

def _safe_float(val):
    try:
        return float(val or 0)
    except Exception:
        return 0.0

def _query(db, sql, params=None):
    try:
        row = db.execute(text(sql), params or {}).fetchone()
        if row is None:
            return {}
        if hasattr(row, "_mapping"):
            return dict(row._mapping)
        return {}
    except Exception as _e:
        import sys
        print(f"[twin._query] ERROR: {_e}", file=sys.stderr)
        try:
            db.rollback()
        except Exception:
            pass
        return {}

@router.get("/state", summary="Digital Twin operational state")
def get_twin_state(db: Session = Depends(get_db)):
    """
    Program M — Digital Twin.
    Returns live operational snapshot. Always returns valid JSON.
    Health score: 100 minus deductions for operational issues.
    """
    health = 100
    now    = datetime.datetime.utcnow()

    # Work Orders
    wo = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN status IN ('open','assigned','in_progress') THEN 1 ELSE 0 END) as active,
               sum(CASE WHEN priority='critical' AND status NOT IN ('completed','closed','cancelled') THEN 1 ELSE 0 END) as critical_open,
               sum(CASE WHEN due_date < NOW() AND status NOT IN ('completed','closed','cancelled') THEN 1 ELSE 0 END) as overdue
        FROM work_orders
    """)
    critical_open = _safe_int(wo.get("critical_open"))
    overdue_wo    = _safe_int(wo.get("overdue"))
    health -= min(10, critical_open * 2)
    health -= min(5, round(overdue_wo * 0.5))

    # Technicians
    tech = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN is_active THEN 1 ELSE 0 END) as active,
               sum(CASE WHEN current_work_orders >= max_work_orders THEN 1 ELSE 0 END) as at_capacity
        FROM technicians
    """)
    health -= min(3, round(_safe_int(tech.get("at_capacity")) * 0.5))

    # Assets
    ast = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN status='Operational' THEN 1 ELSE 0 END) as active,
               sum(CASE WHEN criticality='critical' THEN 1 ELSE 0 END) as critical_count
        FROM assets
    """)

    # Inventory
    inv = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN sb.qty_on_hand < ii.min_stock THEN 1 ELSE 0 END) as below_min
        FROM inventory_items ii LEFT JOIN stock_balances sb ON sb.item_id = ii.id
    """)
    health -= min(3, round(_safe_int(inv.get("below_min")) * 0.1))

    # Finance
    fin = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN status IN ('sent','draft') THEN 1 ELSE 0 END) as unpaid,
               sum(CASE WHEN status='overdue' THEN 1 ELSE 0 END) as overdue_inv,
               COALESCE(sum(amount), 0) as total_value
        FROM invoices
    """)
    health -= min(4, round(_safe_int(fin.get("overdue_inv")) * 0.5))

    # Maintenance
    maint = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN next_due_ts < NOW() AND status='active' THEN 1 ELSE 0 END) as overdue
        FROM maintenance_plans
    """)
    health -= min(5, round(_safe_int(maint.get("overdue")) * 0.5))

    # Projects
    proj = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN status='active' THEN 1 ELSE 0 END) as active
        FROM projects
    """)

    # Contracts
    contracts = _query(db, """
        SELECT count(*) as total,
               sum(CASE WHEN status='active' THEN 1 ELSE 0 END) as active,
               sum(CASE WHEN end_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
                        AND status='active' THEN 1 ELSE 0 END) as expiring_30
        FROM contracts
    """)

    health = max(0, min(100, health))

    if health >= 80:
        label = "Healthy"
    elif health >= 60:
        label = "Warning"
    elif health >= 40:
        label = "Degraded"
    else:
        label = "Critical"

    return {
        "health_score":  health,
        "health_label":  label,
        "generated_at":  now.isoformat(),
        "platform":      "Triangle Black Enterprise Operations Platform",
        "version":       "2.0-sprint164",
        "operational_domains": [
            {"domain": "Work Orders",  "total": _safe_int(wo.get("total")),
             "active": _safe_int(wo.get("active")),
             "critical_open": critical_open, "overdue": overdue_wo},
            {"domain": "Technicians",  "total": _safe_int(tech.get("total")),
             "active": _safe_int(tech.get("active")),
             "at_capacity": _safe_int(tech.get("at_capacity"))},
            {"domain": "Assets",       "total": _safe_int(ast.get("total")),
             "active": _safe_int(ast.get("active")),
             "critical": _safe_int(ast.get("critical_count"))},
            {"domain": "Inventory",    "total": _safe_int(inv.get("total")),
             "below_min": _safe_int(inv.get("below_min"))},
            {"domain": "Finance",      "total": _safe_int(fin.get("total")),
             "unpaid": _safe_int(fin.get("unpaid")),
             "overdue": _safe_int(fin.get("overdue_inv")),
             "total_value_egp": _safe_float(fin.get("total_value"))},
            {"domain": "Maintenance",  "total": _safe_int(maint.get("total")),
             "overdue": _safe_int(maint.get("overdue"))},
            {"domain": "Projects",     "total": _safe_int(proj.get("total")),
             "active": _safe_int(proj.get("active"))},
            {"domain": "Contracts",    "total": _safe_int(contracts.get("total")),
             "active": _safe_int(contracts.get("active")),
             "expiring_30": _safe_int(contracts.get("expiring_30"))},
        ],
    }

# ── T-023: Digital Twin Graph Query API ───────────────────────────────────────
from src.core.tenant import get_hotel_id

@router.get("/graph/stats")
def get_twin_graph_stats(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """Twin graph statistics for this tenant — T-023"""
    try:
        from src.commercial.digital_twin.projector import TwinQuery
        tq = TwinQuery(db=db, hotel_id=hotel_id)
        return tq.get_stats()
    except Exception as e:
        return {"hotel_id": hotel_id, "error": str(e)}


@router.get("/graph/node/{entity_type}/{entity_id}")
def get_twin_node(
    entity_type: str,
    entity_id: str,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """Fetch a single twin node by entity type and ID — T-023"""
    try:
        from src.commercial.digital_twin.projector import TwinQuery
        tq = TwinQuery(db=db, hotel_id=hotel_id)
        node = tq.get_node(entity_type=entity_type, entity_id=entity_id)
        if not node:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Twin node not found")
        return node
    except Exception as e:
        return {"hotel_id": hotel_id, "entity_type": entity_type,
                "entity_id": entity_id, "error": str(e)}


@router.get("/graph/impact/{entity_type}/{entity_id}")
def get_twin_impact(
    entity_type: str,
    entity_id: str,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """Get all entities connected to this entity in the twin graph — T-023"""
    try:
        from src.commercial.digital_twin.projector import TwinQuery
        tq = TwinQuery(db=db, hotel_id=hotel_id)
        return tq.get_impact(entity_type=entity_type, entity_id=entity_id)
    except Exception as e:
        return {"hotel_id": hotel_id, "entity_type": entity_type,
                "entity_id": entity_id, "connected_count": 0, "edges": [], "error": str(e)}


@router.post("/graph/project/{entity_type}/{entity_id}")
def project_twin_event(
    entity_type: str,
    entity_id: str,
    data: dict,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """Manually project an entity event into the twin graph — T-023"""
    try:
        from src.commercial.digital_twin.projector import TwinProjector
        tp = TwinProjector(db=db, hotel_id=hotel_id)
        event = {
            "event_type": data.get("event_type", f"{entity_type}.updated"),
            "aggregate_id": entity_id,
            "aggregate_type": entity_type,
            "payload": data.get("payload", {}),
        }
        success = tp.project_event(event)
        return {"ok": success, "hotel_id": hotel_id,
                "entity_type": entity_type, "entity_id": entity_id}
    except Exception as e:
        return {"ok": False, "hotel_id": hotel_id, "error": str(e)}


# ── T-011: Digital Twin Projection Endpoints ──────────────────────────────────

@router.post("/project/bootstrap")
def bootstrap_twin_from_data(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Seed the Digital Twin graph from existing OLTP data."""
    from src.commercial.digital_twin.projector import DigitalTwinProjector
    projector = DigitalTwinProjector(db=db, hotel_id=hotel_id)
    return projector.project_from_existing_data()


@router.get("/asset/{asset_id}/impact")
def get_asset_impact(
    asset_id: str,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Return all twin entities connected to this asset."""
    from src.commercial.digital_twin.projector import DigitalTwinProjector
    projector = DigitalTwinProjector(db=db, hotel_id=hotel_id)
    return projector.get_node_impact("asset", asset_id)


@router.get("/work-order/{wo_id}/impact")
def get_wo_impact(
    wo_id: str,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Return all twin entities connected to this work order."""
    from src.commercial.digital_twin.projector import DigitalTwinProjector
    projector = DigitalTwinProjector(db=db, hotel_id=hotel_id)
    return projector.get_node_impact("work_order", wo_id)


@router.post("/project/event")
def project_single_event(
    event: dict,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Project a single domain event into the twin graph."""
    from src.commercial.digital_twin.projector import DigitalTwinProjector
    projector = DigitalTwinProjector(db=db, hotel_id=hotel_id)
    projected = projector.project_event(event)
    return {"projected": projected, "hotel_id": hotel_id}


# ── Digital Twin 2.0 Semantic Graph Endpoints (Sprint D-003) ────────────────
@router.get("/semantic-graph/traverse/{entity_type}/{entity_id}", tags=["Digital Twin"])
def traverse_semantic_graph_endpoint(
    entity_type: str,
    entity_id: str,
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Traverses multi-hop operational relationships across assets, WOs, suppliers, and zones."""
    from src.commercial.digital_twin.semantic_graph import SemanticGraphService
    service = SemanticGraphService(db=db, hotel_id=hotel_id)
    return service.traverse_entity_graph(entity_type=entity_type, entity_id=entity_id)

@router.post("/semantic-graph/simulate-failure", tags=["Digital Twin"])
def simulate_failure_endpoint(
    payload: dict,
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Simulates downstream blast radius and SLA financial penalties for asset failure."""
    from src.commercial.digital_twin.semantic_graph import SemanticGraphService
    asset_id = payload.get("asset_id", "ast-chiller-01")
    service = SemanticGraphService(db=db, hotel_id=hotel_id)
    return service.simulate_failure_blast_radius(asset_id=asset_id)
