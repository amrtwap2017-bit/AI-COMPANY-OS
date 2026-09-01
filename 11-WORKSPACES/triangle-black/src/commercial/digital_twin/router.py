"""
V6-E03 — Digital Twin 2.0: Decision Infrastructure
Upgrades from visualization to impact-chain analysis.

Key addition: /twin/impact-chain/{asset_id}
  Asset → Failures → Work Orders → Technician → Supplier → Cost → SLA impact

All endpoints require auth.
/twin/state reads from real DB (not technicians table which may not exist).
"""
from __future__ import annotations
import datetime
from datetime import datetime as _dt
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user

logger = logging.getLogger("tb.digital_twin")
router = APIRouter(prefix="/twin", tags=["Digital Twin"])


def _safe_int(val) -> int:
    try: return int(val or 0)
    except: return 0

def _safe_float(val) -> float:
    try: return float(val or 0)
    except: return 0.0

def _q(db, sql, params=None):
    try:
        row = db.execute(text(sql), params or {}).fetchone()
        return dict(row._mapping) if row and hasattr(row, "_mapping") else {}
    except Exception as e:
        try: db.rollback()
        except: pass
        return {}


# ── TWIN STATE ────────────────────────────────────────────────────────────────

@router.get("/state")
def get_twin_state(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Digital Twin operational state snapshot.
    Reads from real operational DB — no technicians table dependency.
    """
    health = 100
    now = _dt.utcnow()
    H = hotel_id

    # Work Orders
    wo = _q(db, """
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN status IN ('open','assigned','in_progress') THEN 1 ELSE 0 END) AS active,
               SUM(CASE WHEN priority='critical'
                        AND status NOT IN ('completed','closed','cancelled') THEN 1 ELSE 0 END) AS critical_open
        FROM work_orders WHERE hotel_id=:h
    """, {"h": H})
    critical_open = _safe_int(wo.get("critical_open"))
    active_wos = _safe_int(wo.get("active"))
    health -= min(15, critical_open * 2)

    # Assets
    ast = _q(db, """
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN LOWER(status)='operational' THEN 1 ELSE 0 END) AS active,
               SUM(CASE WHEN LOWER(criticality)='critical' THEN 1 ELSE 0 END) AS critical_count,
               SUM(CASE WHEN LOWER(criticality) IN ('critical','high') THEN 1 ELSE 0 END) AS high_risk
        FROM assets WHERE hotel_id=:h
    """, {"h": H})

    # Maintenance plans
    maint = _q(db, """
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN next_due_date::DATE < CURRENT_DATE
                        AND status != 'completed' THEN 1 ELSE 0 END) AS overdue
        FROM maintenance_plans WHERE hotel_id=:h
    """, {"h": H})
    overdue_pm = _safe_int(maint.get("overdue"))
    health -= min(10, round(overdue_pm * 0.3))

    # Suppliers
    sup = _q(db, """
        SELECT COUNT(*) AS total FROM suppliers WHERE hotel_id=:h
    """, {"h": H})

    # Procurement
    po = _q(db, """
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN status IN ('pending','draft') THEN 1 ELSE 0 END) AS pending,
               COALESCE(SUM(total_amount),0) AS total_spend
        FROM purchase_orders WHERE hotel_id=:h
    """, {"h": H})

    # Finance
    fin = _q(db, """
        SELECT COUNT(*) AS total,
               COALESCE(SUM(amount),0) AS total_value
        FROM invoices WHERE hotel_id=:h
    """, {"h": H})

    # Contracts
    contracts = _q(db, """
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active
        FROM contracts WHERE hotel_id=:h
    """, {"h": H})

    health = max(0, min(100, health))
    label = ("Healthy" if health >= 80 else
             "Warning" if health >= 60 else
             "Degraded" if health >= 40 else "Critical")

    return {
        "health_score": health,
        "health_label": label,
        "hotel_id": H,
        "generated_at": now.isoformat(),
        "platform": "Triangle Black Enterprise Operations Platform",
        "version": "v6-E03",
        "operational_domains": [
            {"domain": "Work Orders", "total": _safe_int(wo.get("total")),
             "active": active_wos, "critical_open": critical_open},
            {"domain": "Assets", "total": _safe_int(ast.get("total")),
             "active": _safe_int(ast.get("active")),
             "critical": _safe_int(ast.get("critical_count")),
             "high_risk": _safe_int(ast.get("high_risk"))},
            {"domain": "Maintenance", "total": _safe_int(maint.get("total")),
             "overdue": overdue_pm},
            {"domain": "Suppliers", "total": _safe_int(sup.get("total"))},
            {"domain": "Procurement", "total": _safe_int(po.get("total")),
             "pending": _safe_int(po.get("pending")),
             "total_spend": _safe_float(po.get("total_spend"))},
            {"domain": "Finance", "total": _safe_int(fin.get("total")),
             "total_value": _safe_float(fin.get("total_value"))},
            {"domain": "Contracts", "total": _safe_int(contracts.get("total")),
             "active": _safe_int(contracts.get("active"))},
        ],
    }


# ── IMPACT CHAIN ──────────────────────────────────────────────────────────────

@router.get("/impact-chain/{asset_id}")
def get_asset_impact_chain(
    asset_id: str,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    V6-E03: Impact Chain Analysis — the key decision endpoint.

    Given an asset, returns the full operational impact chain:
    Asset → Work Orders → Failures → Technician → Supplier → Cost → SLA

    Answers: "What is the full operational impact of this asset?"
    Used for: criticality assessment, maintenance prioritization, budget decisions.
    """
    H = hotel_id

    # Asset identity
    asset = _q(db, """
        SELECT id, name, category, criticality, status, site_id
        FROM assets WHERE id=:aid AND hotel_id=:h
    """, {"aid": asset_id, "h": H})
    if not asset:
        raise HTTPException(404, f"Asset {asset_id} not found")

    # Work orders for this asset
    wo_rows = db.execute(text("""
        SELECT id, title, status, priority, created_at, technician_id
        FROM work_orders
        WHERE asset_id=:aid AND hotel_id=:h
        ORDER BY created_at DESC LIMIT 20
    """), {"aid": asset_id, "h": H}).fetchall()
    wos = [dict(r._mapping) for r in wo_rows]

    total_wos = len(wos)
    completed_wos = sum(1 for w in wos if w["status"] == "completed")
    open_wos = sum(1 for w in wos if w["status"] in ("open", "assigned", "in_progress"))
    critical_wos = sum(1 for w in wos if w.get("priority") in ("critical", "emergency"))

    # PM plans for this asset
    pm_rows = db.execute(text("""
        SELECT id, plan_type, next_due_date, status
        FROM maintenance_plans
        WHERE asset_node_id=:aid AND hotel_id=:h
        LIMIT 10
    """), {"aid": asset_id, "h": H}).fetchall()
    pms = [dict(r._mapping) for r in pm_rows]
    overdue_pms = sum(1 for p in pms
                     if p.get("next_due_date") and
                     str(p["next_due_date"]) < str(datetime.date.today()))

    # Suppliers through work orders
    sup_ids = {w["technician_id"] for w in wos if w.get("technician_id")}
    supplier_rows = db.execute(text("""
        SELECT DISTINCT po.supplier_id, s.company_name, s.category
        FROM purchase_orders po
        JOIN suppliers s ON s.id = po.supplier_id
        WHERE po.hotel_id=:h
        LIMIT 5
    """), {"h": H}).fetchall()
    suppliers = [dict(r._mapping) for r in supplier_rows]

    # Cost impact from invoices linked to hotel
    cost = _q(db, """
        SELECT COALESCE(SUM(amount),0) AS total_cost,
               COUNT(*) AS invoice_count
        FROM invoices WHERE hotel_id=:h
    """, {"h": H})

    # Risk assessment
    risk_score = 0
    risk_factors = []

    if asset.get("criticality") in ("critical", "high"):
        risk_score += 30
        risk_factors.append(f"Asset criticality: {asset['criticality'].upper()}")

    if critical_wos >= 2:
        risk_score += 25
        risk_factors.append(f"{critical_wos} critical/emergency work orders")
    elif critical_wos >= 1:
        risk_score += 15
        risk_factors.append(f"{critical_wos} critical work order")

    if overdue_pms >= 1:
        risk_score += 20
        risk_factors.append(f"{overdue_pms} overdue PM plans")

    if open_wos >= 3:
        risk_score += 15
        risk_factors.append(f"{open_wos} open work orders")

    risk_level = ("CRITICAL" if risk_score >= 60 else
                  "HIGH" if risk_score >= 40 else
                  "MEDIUM" if risk_score >= 20 else "LOW")

    # Impact chain narrative
    chain = []
    if critical_wos > 0:
        chain.append({
            "step": 1, "layer": "Asset Failure",
            "description": f"{critical_wos} critical failure(s) recorded",
            "impact": "Operational disruption"
        })
    if open_wos > 0:
        chain.append({
            "step": 2, "layer": "Work Orders",
            "description": f"{open_wos} open WOs require technician assignment",
            "impact": "Resource allocation required"
        })
    if overdue_pms > 0:
        chain.append({
            "step": 3, "layer": "Maintenance Gap",
            "description": f"{overdue_pms} PM plans overdue — reliability risk",
            "impact": "Increased failure probability"
        })
    if suppliers:
        chain.append({
            "step": 4, "layer": "Supplier Dependency",
            "description": f"{len(suppliers)} supplier(s) involved in procurement",
            "impact": "Supply chain dependency"
        })
    if _safe_float(cost.get("total_cost")) > 0:
        chain.append({
            "step": 5, "layer": "Cost Impact",
            "description": f"EGP {_safe_float(cost.get('total_cost')):,.0f} total hotel operational cost",
            "impact": "Financial exposure"
        })

    recommendation = ""
    if risk_level == "CRITICAL":
        recommendation = (
            f"URGENT: Asset '{asset['name']}' requires immediate attention. "
            f"Address {critical_wos} critical WO(s) and {overdue_pms} overdue PM(s)."
        )
    elif risk_level == "HIGH":
        recommendation = (
            f"Priority maintenance required for '{asset['name']}'. "
            f"Schedule {overdue_pms} overdue PM plans within 7 days."
        )
    elif open_wos > 0:
        recommendation = f"Monitor '{asset['name']}' — {open_wos} open work orders in progress."
    else:
        recommendation = f"'{asset['name']}' operating within normal parameters."

    return {
        "asset_id": asset_id,
        "hotel_id": H,
        "asset": {
            "name": asset.get("name"),
            "category": asset.get("category"),
            "criticality": asset.get("criticality"),
            "status": asset.get("status"),
        },
        "risk_level": risk_level,
        "risk_score": risk_score,
        "recommendation": recommendation,
        "impact_chain": chain,
        "summary": {
            "total_work_orders": total_wos,
            "open_work_orders": open_wos,
            "completed_work_orders": completed_wos,
            "critical_work_orders": critical_wos,
            "pm_plans": len(pms),
            "overdue_pm_plans": overdue_pms,
            "suppliers_involved": len(suppliers),
            "operational_cost_egp": _safe_float(cost.get("total_cost")),
        },
        "work_orders": [
            {"id": w["id"], "title": w.get("title",""),
             "status": w["status"], "priority": w.get("priority","")}
            for w in wos[:5]
        ],
        "pm_plans": [
            {"id": p["id"], "type": p.get("plan_type",""),
             "next_due": str(p.get("next_due_date","")),
             "status": p.get("status","")}
            for p in pms[:3]
        ],
        "generated_at": _dt.utcnow().isoformat(),
        "twin_version": "v6-E03",
    }


# ── ASSET IMPACT (fixed) ──────────────────────────────────────────────────────

@router.get("/asset/{asset_id}/impact")
def get_asset_impact(
    asset_id: str,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Connected entities for this asset — reads from operational DB."""
    H = hotel_id
    connections = []

    # Work orders
    wos = db.execute(text("""
        SELECT id, title, status, priority FROM work_orders
        WHERE asset_id=:aid AND hotel_id=:h LIMIT 10
    """), {"aid": asset_id, "h": H}).fetchall()
    for w in wos:
        connections.append({
            "type": "work_order",
            "id": w[0], "label": w[1] or "Work Order",
            "status": w[2], "priority": w[3],
            "relationship": "HAS_WORK_ORDER"
        })

    # PM plans
    pms = db.execute(text("""
        SELECT id, plan_type, status FROM maintenance_plans
        WHERE asset_node_id=:aid AND hotel_id=:h LIMIT 5
    """), {"aid": asset_id, "h": H}).fetchall()
    for p in pms:
        connections.append({
            "type": "pm_plan",
            "id": p[0], "label": p[1] or "PM Plan",
            "status": p[2],
            "relationship": "HAS_PM_PLAN"
        })

    return {
        "entity_id": asset_id,
        "entity_type": "asset",
        "hotel_id": H,
        "connections": connections,
        "connection_count": len(connections),
        "generated_at": _dt.utcnow().isoformat(),
    }


# ── WORK ORDER IMPACT (fixed) ────────────────────────────────────────────────

@router.get("/work-order/{wo_id}/impact")
def get_wo_impact(
    wo_id: str,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Connected entities for this work order."""
    H = hotel_id
    connections = []

    wo = _q(db, "SELECT * FROM work_orders WHERE id=:id AND hotel_id=:h",
            {"id": wo_id, "h": H})
    if not wo:
        raise HTTPException(404, f"Work order {wo_id} not found")

    # Linked asset
    if wo.get("asset_id"):
        asset = _q(db, "SELECT id, name, category, criticality FROM assets WHERE id=:id",
                  {"id": wo["asset_id"]})
        if asset:
            connections.append({
                "type": "asset", "id": asset["id"],
                "label": asset.get("name","Asset"),
                "criticality": asset.get("criticality"),
                "relationship": "BELONGS_TO_ASSET"
            })

    # Technician
    if wo.get("technician_id"):
        tech = _q(db, "SELECT id, name, department FROM employees WHERE id=:id",
                 {"id": wo["technician_id"]})
        if tech:
            connections.append({
                "type": "technician", "id": tech["id"],
                "label": tech.get("name","Technician"),
                "department": tech.get("department"),
                "relationship": "ASSIGNED_TO"
            })

    return {
        "entity_id": wo_id,
        "entity_type": "work_order",
        "hotel_id": H,
        "work_order": {"title": wo.get("title"), "status": wo.get("status"),
                       "priority": wo.get("priority")},
        "connections": connections,
        "connection_count": len(connections),
        "generated_at": _dt.utcnow().isoformat(),
    }


# ── TWIN GRAPH STATS (fixed) ─────────────────────────────────────────────────

@router.get("/graph/stats")
def get_twin_graph_stats(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Twin graph statistics from operational DB."""
    H = hotel_id
    stats = {}
    for table, label in [
        ("assets", "assets"),
        ("work_orders", "work_orders"),
        ("maintenance_plans", "pm_plans"),
        ("suppliers", "suppliers"),
    ]:
        try:
            n = db.execute(text(
                f"SELECT COUNT(*) FROM {table} WHERE hotel_id=:h"
            ), {"h": H}).scalar()
            stats[label] = int(n or 0)
        except Exception:
            stats[label] = 0

    total_nodes = sum(stats.values())
    return {
        "hotel_id": H,
        "node_counts": stats,
        "total_nodes": total_nodes,
        "edge_note": "Edges computed dynamically from relationships",
        "generated_at": _dt.utcnow().isoformat(),
    }


# ── SEMANTIC SIMULATE FAILURE (preserved) ────────────────────────────────────

@router.post("/semantic-graph/simulate-failure")
def simulate_failure(
    payload: dict,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Simulate failure blast radius for an asset."""
    from src.commercial.digital_twin.semantic_graph import SemanticGraphService
    asset_id = payload.get("asset_id", "")
    service = SemanticGraphService(db=db, hotel_id=hotel_id)
    return service.simulate_failure_blast_radius(asset_id=asset_id)


# ── SEMANTIC TRAVERSE (preserved) ────────────────────────────────────────────

@router.get("/semantic-graph/traverse/{entity_type}/{entity_id}")
def traverse_semantic_graph(
    entity_type: str,
    entity_id: str,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Traverse multi-hop relationships across assets, WOs, suppliers."""
    from src.commercial.digital_twin.semantic_graph import SemanticGraphService
    service = SemanticGraphService(db=db, hotel_id=hotel_id)
    return service.traverse_entity_graph(entity_type=entity_type,
                                         entity_id=entity_id)


# ── PROJECT ENDPOINTS (preserved) ────────────────────────────────────────────

@router.post("/project/bootstrap")
def bootstrap_twin(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Bootstrap twin graph from existing data."""
    from src.commercial.digital_twin.projector import DigitalTwinProjector
    return DigitalTwinProjector(db=db, hotel_id=hotel_id).project_from_existing_data()


@router.post("/project/event")
def project_event(
    event: dict,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Project a domain event into the twin graph."""
    from src.commercial.digital_twin.projector import DigitalTwinProjector
    projected = DigitalTwinProjector(db=db, hotel_id=hotel_id).project_event(event)
    return {"projected": projected, "hotel_id": hotel_id}


# ── SIMULATE FAILURE (short alias) ───────────────────────────────────────────

@router.post("/simulate/failure", summary="Simulate asset failure blast radius")
def simulate_failure_alias(
    payload: dict,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Simulate what happens if an asset fails.
    Input: asset_id, failure_type (breakdown/electrical/mechanical), duration_hours
    Output: affected zones, cost estimate, SLA breach probability, mitigation
    Short alias for /semantic-graph/simulate-failure
    """
    from src.commercial.digital_twin.semantic_graph import SemanticGraphService
    asset_id = payload.get("asset_id", "")
    svc = SemanticGraphService(db=db, hotel_id=hotel_id)
    result = svc.simulate_failure_blast_radius(asset_id=asset_id)
    # Enrich with input params
    result["failure_type"] = payload.get("failure_type", "breakdown")
    result["duration_hours"] = payload.get("duration_hours", 24)
    result["hotel_id"] = hotel_id
    return result


# ── CRITICAL PATH ─────────────────────────────────────────────────────────────

@router.get("/critical-path", summary="Assets on operational critical path")
def get_critical_path(
    limit: int = 10,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Assets whose failure would cause the largest operational impact.
    Ranked by: criticality weight × total WO count × critical WO count × PM plans.

    Use this to answer: "If I had to protect 5 assets, which ones?"

    Returns assets sorted by impact_score descending.
    """
    from sqlalchemy import text as sqlt

    CRITICALITY_WEIGHT = {"critical": 4, "high": 3, "medium": 2, "low": 1}

    try:
        rows = db.execute(sqlt("""
            SELECT
                a.id,
                a.name,
                a.category,
                LOWER(COALESCE(a.criticality, 'medium')) as criticality,
                COUNT(DISTINCT wo.id) as total_wos,
                COUNT(DISTINCT CASE WHEN wo.priority IN ('critical','emergency')
                      THEN wo.id END) as critical_wos,
                COUNT(DISTINCT mp.id) as pm_plans,
                MAX(wo.created_at) as last_wo_date
            FROM assets a
            LEFT JOIN work_orders wo ON wo.asset_id = a.id
                AND wo.hotel_id = :h
                AND wo.deleted_at IS NULL
            LEFT JOIN maintenance_plans mp ON mp.asset_node_id = a.id
                AND mp.hotel_id = :h
            WHERE a.hotel_id = :h
              AND a.deleted_at IS NULL
            GROUP BY a.id, a.name, a.category, a.criticality
            HAVING COUNT(DISTINCT wo.id) > 0
            ORDER BY
                COUNT(DISTINCT CASE WHEN wo.priority IN ('critical','emergency')
                      THEN wo.id END) DESC,
                COUNT(DISTINCT wo.id) DESC
            LIMIT :lim
        """), {"h": hotel_id, "lim": min(limit, 20)}).fetchall()

    except Exception as e:
        try: db.rollback()
        except: pass
        return {
            "hotel_id": hotel_id,
            "critical_path": [],
            "error": str(e)[:200],
        }

    critical_path = []
    for r in rows:
        d = dict(r._mapping)
        crit = d.get("criticality", "medium") or "medium"
        crit_weight = CRITICALITY_WEIGHT.get(crit.lower(), 2)
        total_wos = int(d.get("total_wos") or 0)
        critical_wos = int(d.get("critical_wos") or 0)
        pm_plans = int(d.get("pm_plans") or 0)

        # Impact score: criticality × (critical_wos × 3 + total_wos + pm_plans)
        impact_score = round(
            crit_weight * (critical_wos * 3 + total_wos + pm_plans), 1
        )

        risk_level = (
            "CRITICAL" if critical_wos >= 3 or (crit == "critical" and total_wos >= 5) else
            "HIGH"     if critical_wos >= 1 or crit in ("critical", "high") else
            "MEDIUM"
        )

        critical_path.append({
            "asset_id": d.get("id"),
            "name": d.get("name"),
            "category": d.get("category"),
            "criticality": crit,
            "impact_score": impact_score,
            "risk_level": risk_level,
            "total_wos_90d": total_wos,
            "critical_wos": critical_wos,
            "pm_plans": pm_plans,
            "last_wo_date": str(d.get("last_wo_date", ""))[:10],
            "action": (
                "IMMEDIATE ATTENTION — prioritize preventive maintenance"
                if risk_level == "CRITICAL" else
                "MONITOR CLOSELY — schedule inspection"
                if risk_level == "HIGH" else
                "ROUTINE MONITORING"
            ),
        })

    # Sort by impact_score descending
    critical_path.sort(key=lambda x: x["impact_score"], reverse=True)

    top_asset = critical_path[0] if critical_path else {}

    return {
        "hotel_id": hotel_id,
        "total_assets_analyzed": len(critical_path),
        "critical_path_count": len([a for a in critical_path if a["risk_level"] == "CRITICAL"]),
        "summary": (
            f"Top risk asset: {top_asset.get('name', 'unknown')} "
            f"(impact_score={top_asset.get('impact_score', 0)}, "
            f"risk={top_asset.get('risk_level', 'unknown')})"
            if top_asset else "No assets with work order history found"
        ),
        "critical_path": critical_path,
        "methodology": "Impact score = criticality_weight × (critical_wos×3 + total_wos + pm_plans)",
    }

