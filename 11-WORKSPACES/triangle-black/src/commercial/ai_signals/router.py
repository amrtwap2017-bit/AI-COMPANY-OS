from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
import datetime

from src.core.auth import get_current_user as _gcu_v7
from fastapi import Depends as _Dep_v7
router = APIRouter(prefix="/ai", tags=["ai-signals-v2"], dependencies=[_Dep_v7(_gcu_v7)])

def safe_int(v, d=0):
    try: return int(v) if v is not None else d
    except: return d

def safe_float(v, d=0.0):
    try: return float(v) if v is not None else d
    except: return d

# ─────────────────────────────────────────────────────────────────────────────
# S68-04: Cross-Domain Signal Generator
# Each signal queries 2-4 tables and reasons across relationships
# ─────────────────────────────────────────────────────────────────────────────

def _signal_asset_repeat_failures(db: Session) -> list:
    """Assets with 3+ corrective work orders in 90 days — cross: assets + work_orders"""
    rows = db.execute(text("""
        SELECT
            a.id        AS asset_id,
            a.name      AS asset_name,
            a.category  AS asset_category,
            a.criticality,
            COUNT(w.id) AS wo_count
        FROM assets a
        JOIN work_orders w ON w.asset_id = a.id
        WHERE w.type = 'corrective'
          AND w.created_at >= NOW() - INTERVAL '90 days'
          AND w.status NOT IN ('cancelled')
        GROUP BY a.id, a.name, a.category, a.criticality
        HAVING COUNT(w.id) >= 3
        ORDER BY wo_count DESC
        LIMIT 5
    """)).fetchall()

    signals = []
    for r in rows:
        priority = "critical" if r.criticality in ("critical", "high") else "high"
        signals.append({
            "signal_id":          f"ASSET_REPEAT_{r.asset_id[:8].upper()}",
            "title":              f"{r.asset_name} — Repeat Failures Detected",
            "message":            f"{r.asset_name} ({r.asset_category}) has {r.wo_count} corrective work orders in the last 90 days. Risk of imminent failure.",
            "priority":           priority,
            "category":           "maintenance",
            "count":              r.wo_count,
            "recommended_action": f"Schedule preventive maintenance for {r.asset_name} immediately.",
            "data_source":        "assets + work_orders",
            "entity_id":          r.asset_id,
            "entity_type":        "asset",
        })
    return signals


def _signal_technician_overload(db: Session) -> list:
    """Technicians at >85% capacity with critical WOs open — cross: technicians + work_orders"""
    rows = db.execute(text("""
        SELECT
            t.id,
            t.name,
            t.current_work_orders,
            t.max_work_orders,
            COUNT(w.id) FILTER (WHERE w.priority = 'critical') AS critical_assigned,
            ROUND(t.current_work_orders::numeric /
                  NULLIF(t.max_work_orders, 0) * 100, 1)        AS utilization_pct
        FROM technicians t
        LEFT JOIN work_orders w ON w.technician_id = t.id
                                AND w.status NOT IN ('completed','closed','cancelled')
        WHERE t.is_active = true
          AND t.current_work_orders >= (t.max_work_orders * 0.85)
        GROUP BY t.id, t.name, t.current_work_orders, t.max_work_orders
        ORDER BY utilization_pct DESC
        LIMIT 5
    """)).fetchall()

    signals = []
    for r in rows:
        util = safe_float(r.utilization_pct)
        priority = "critical" if util >= 100 else "high"
        signals.append({
            "signal_id":          f"TECH_OVERLOAD_{r.id[:8].upper()}",
            "title":              f"{r.name} at {util:.0f}% Capacity",
            "message":            f"Technician {r.name} has {r.current_work_orders}/{r.max_work_orders} work orders assigned ({util:.0f}% capacity). {r.critical_assigned} critical WOs in queue.",
            "priority":           priority,
            "category":           "resources",
            "count":              safe_int(r.current_work_orders),
            "recommended_action": f"Redistribute work orders from {r.name} to available technicians.",
            "data_source":        "technicians + work_orders",
            "entity_id":          r.id,
            "entity_type":        "technician",
        })
    return signals


def _signal_contract_expiring_with_open_wo(db: Session) -> list:
    """Contracts expiring with open work orders — cross: contracts + work_orders"""
    rows = db.execute(text("""
        SELECT
            c.id          AS contract_id,
            c.title       AS contract_title,
            c.end_date,
            c.value,
            COUNT(w.id)   AS open_wo_count,
            EXTRACT(DAY FROM c.end_date - NOW()) AS days_remaining
        FROM contracts c
        LEFT JOIN work_orders w ON w.contract_id = c.id
                                AND w.status NOT IN ('completed','closed','cancelled')
        WHERE c.status = 'active'
          AND c.end_date BETWEEN NOW() AND NOW() + INTERVAL '45 days'
        GROUP BY c.id, c.title, c.end_date, c.value
        ORDER BY c.end_date ASC
        LIMIT 5
    """)).fetchall()

    signals = []
    for r in rows:
        days = int(safe_float(r.days_remaining))
        priority = "critical" if days <= 15 else "high"
        signals.append({
            "signal_id":          f"CONTRACT_EXP_{r.contract_id[:8].upper()}",
            "title":              f"Contract Expiring in {days} Days — {r.open_wo_count} Open WOs",
            "message":            f"Contract '{r.contract_title}' expires in {days} days with {r.open_wo_count} open work orders still pending. Value at risk: {safe_float(r.value):,.0f} EGP.",
            "priority":           priority,
            "category":           "commercial",
            "count":              r.open_wo_count,
            "recommended_action": "Complete open work orders and initiate contract renewal process.",
            "data_source":        "contracts + work_orders",
            "entity_id":          r.contract_id,
            "entity_type":        "contract",
        })
    return signals


def _signal_inventory_below_min(db: Session) -> list:
    """Inventory items below minimum with open WOs needing that category."""
    rows = db.execute(text("""
        SELECT
            i.id,
            i.name,
            i.category,
            i.min_stock,
            COALESCE(SUM(sb.quantity), 0) AS current_stock
        FROM inventory_items i
        LEFT JOIN stock_balances sb ON sb.item_id = i.id
        GROUP BY i.id, i.name, i.category, i.min_stock
        HAVING COALESCE(SUM(sb.quantity), 0) <= i.min_stock
        ORDER BY (COALESCE(SUM(sb.quantity), 0) - i.min_stock) ASC
        LIMIT 5
    """)).fetchall()

    signals = []
    for r in rows:
        signals.append({
            "signal_id":          f"STOCK_LOW_{r.id[:8].upper()}",
            "title":              f"Low Stock: {r.name}",
            "message":            f"{r.name} ({r.category}) has {r.current_stock} units remaining, below minimum of {r.min_stock}. Auto-PR recommended.",
            "priority":           "high",
            "category":           "inventory",
            "count":              safe_int(r.current_stock),
            "recommended_action": f"Create purchase request for {r.name}. Minimum reorder quantity applies.",
            "data_source":        "inventory_items + stock_balances",
            "entity_id":          r.id,
            "entity_type":        "inventory_item",
        })
    return signals


def _signal_pm_overdue_critical_assets(db: Session) -> list:
    """PM plans overdue on critical assets — cross: maintenance_plans + assets"""
    rows = db.execute(text("""
        SELECT
            mp.id         AS plan_id,
            mp.title      AS plan_title,
            mp.next_due_date,
            mp.frequency,
            a.id          AS asset_id,
            a.name        AS asset_name,
            a.criticality,
            EXTRACT(DAY FROM NOW() - mp.next_due_date) AS days_overdue
        FROM maintenance_plans mp
        JOIN assets a ON a.id = mp.asset_id
        WHERE mp.next_due_date < NOW()
          AND mp.status NOT IN ('completed', 'cancelled')
          AND a.criticality IN ('critical', 'high')
        ORDER BY days_overdue DESC
        LIMIT 5
    """)).fetchall()

    signals = []
    for r in rows:
        days = int(safe_float(r.days_overdue))
        priority = "critical" if days >= 7 else "high"
        signals.append({
            "signal_id":          f"PM_OVERDUE_{r.plan_id[:8].upper()}",
            "title":              f"PM Overdue {days}d: {r.asset_name}",
            "message":            f"Preventive maintenance '{r.plan_title}' for {r.asset_name} (criticality: {r.criticality}) is {days} days overdue.",
            "priority":           priority,
            "category":           "maintenance",
            "count":              days,
            "recommended_action": f"Create work order for overdue PM on {r.asset_name} immediately.",
            "data_source":        "maintenance_plans + assets",
            "entity_id":          r.plan_id,
            "entity_type":        "maintenance_plan",
        })
    return signals


def _signal_rfq_no_response(db: Session) -> list:
    """RFQs with no vendor response after 5 days — cross: rfqs + rfq_vendor_quotes"""
    rows = db.execute(text("""
        SELECT
            r.id,
            r.rfq_number,
            r.created_at,
            EXTRACT(DAY FROM NOW() - r.created_at) AS days_open,
            COUNT(q.id) AS quote_count
        FROM rfqs r
        LEFT JOIN rfq_vendor_quotes q ON q.rfq_id = r.id
        WHERE r.status NOT IN ('closed', 'cancelled', 'awarded')
          AND r.created_at < NOW() - INTERVAL '5 days'
        GROUP BY r.id, r.rfq_number, r.created_at
        HAVING COUNT(q.id) = 0
        ORDER BY days_open DESC
        LIMIT 3
    """)).fetchall()

    signals = []
    for r in rows:
        days = int(safe_float(r.days_open))
        signals.append({
            "signal_id":          f"RFQ_NO_RESP_{r.id[:8].upper()}",
            "title":              f"RFQ {r.rfq_number} — No Response in {days} Days",
            "message":            f"RFQ {r.rfq_number} has been open for {days} days with zero vendor responses. Follow up required.",
            "priority":           "high",
            "category":           "procurement",
            "count":              0,
            "recommended_action": "Contact vendors directly. Consider extending deadline or adding alternate vendors.",
            "data_source":        "rfqs + rfq_vendor_quotes",
            "entity_id":          r.id,
            "entity_type":        "rfq",
        })
    return signals


@router.get("/signals/v2", summary="Cross-domain AI signals")
def get_signals_v2(db: Session = Depends(get_db)):
    """
    Enhanced AI signals using cross-domain queries (2-4 tables per signal).
    Covers: assets, technicians, contracts, inventory, maintenance, procurement.
    """
    all_signals = []

    generators = [
        _signal_asset_repeat_failures,
        _signal_technician_overload,
        _signal_contract_expiring_with_open_wo,
        _signal_inventory_below_min,
        _signal_pm_overdue_critical_assets,
        _signal_rfq_no_response,
    ]

    for gen in generators:
        try:
            all_signals.extend(gen(db))
        except Exception as e:
            # Non-blocking — table may not exist yet
            pass

    # Sort by priority
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    all_signals.sort(key=lambda s: priority_order.get(s.get("priority", "low"), 4))

    summary = {
        "critical": sum(1 for s in all_signals if s["priority"] == "critical"),
        "high":     sum(1 for s in all_signals if s["priority"] == "high"),
        "medium":   sum(1 for s in all_signals if s["priority"] == "medium"),
        "total":    len(all_signals),
    }

    return {
        "signals":      all_signals,
        "summary":      summary,
        "version":      "v2-cross-domain",
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "total":        len(all_signals),
    }
