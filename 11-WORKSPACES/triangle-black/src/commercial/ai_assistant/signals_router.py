from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from typing import Optional
import datetime

router = APIRouter(prefix="/ai", tags=["ai-signals"])

@router.get("/maintenance/health-scores", summary="Asset health scores and failure predictions")
def get_health_scores(
    hotel_id: str = "tb-default-hotel-000000000001",
    db: Session = Depends(get_db),
):
    assets = [dict(r._mapping) for r in db.execute(text(
        "SELECT id, name, category, criticality, status, "
        "created_at, service_frequency FROM assets WHERE hotel_id=:h"
    ), {"h": hotel_id}).fetchall()]

    CRITICALITY_WEIGHT = {"critical": 2.0, "high": 1.5, "medium": 1.0, "low": 0.5}
    FREQ_DAYS = {"daily":1,"weekly":7,"monthly":30,"quarterly":90,"semi-annual":180,"annually":365}

    results = []
    now = datetime.datetime.utcnow()

    for asset in assets:
        # Count corrective WOs in last 90 days
        wo_count = db.execute(text(
            "SELECT COUNT(*) FROM work_orders WHERE asset_id=:a "
            "AND created_at > NOW() - INTERVAL '90 days'"
        ), {"a": asset["id"]}).scalar() or 0

        # Days since asset created (proxy for age)
        created = asset.get("created_at")
        age_days = (now - created).days if created else 365

        # Expected service interval
        freq = asset.get("service_frequency", "monthly")
        interval_days = FREQ_DAYS.get(freq, 30)

        # Last PM plan for this asset
        pm = db.execute(text(
            "SELECT next_due_date FROM maintenance_plans "
            "WHERE asset_node_id=:a ORDER BY created_at DESC LIMIT 1"
        ), {"a": asset["id"]}).fetchone()
        days_overdue = 0
        if pm and pm[0]:
            try:
                due = datetime.datetime.strptime(str(pm[0])[:10], "%Y-%m-%d")
                days_overdue = max(0, (now - due).days)
            except: pass

        crit_mult = CRITICALITY_WEIGHT.get(asset.get("criticality","medium"), 1.0)

        # Health score: lower = worse
        base = 100
        base -= min(40, wo_count * 15)       # corrective WOs hurt most
        base -= min(30, days_overdue * 0.5)  # overdue PM hurts
        base -= min(20, age_days / 365 * 5) # age penalty
        health = max(0, min(100, base))
        if crit_mult > 1.5: health = max(0, health - 10)

        risk = "critical" if health < 30 else "high" if health < 55 else "medium" if health < 75 else "low"

        pred_days = None
        if health < 50:
            pred_days = int((health / 100) * interval_days)

        action = (
            "IMMEDIATE PM required - high failure risk" if health < 30
            else "Schedule PM within 2 weeks" if health < 55
            else "Monitor - schedule next PM as planned" if health < 75
            else "Asset healthy - maintain schedule"
        )

        results.append({
            "asset_id":    asset["id"],
            "asset_name":  asset["name"],
            "category":    asset["category"],
            "health_score": round(health, 1),
            "risk_level":  risk,
            "corrective_wos_90d": wo_count,
            "days_pm_overdue": days_overdue,
            "recommended_action": action,
            "predicted_failure_days": pred_days,
        })

    results.sort(key=lambda x: x["health_score"])
    return {"assets": results, "total": len(results),
            "critical_count": sum(1 for r in results if r["risk_level"] == "critical"),
            "generated_at": now.isoformat()}

@router.get("/signals", summary="AI operational signals requiring attention")
def get_signals(
    hotel_id: str = "tb-default-hotel-000000000001",
    db: Session = Depends(get_db),
):
    signals = []
    h = {"hotel_id": hotel_id}

    # Signal 1: Critical open work orders
    crit = db.execute(text(
        "SELECT count(*) FROM work_orders WHERE hotel_id=:hotel_id AND priority='critical' AND status!='completed'"
    ), h).scalar() or 0
    if crit > 0:
        signals.append({"id":"S001","level":"critical","title":f"{crit} critical work orders open",
            "action":"Assign and dispatch immediately","endpoint":"/operations/work-orders"})

    # Signal 2: Technician overload
    overloaded = db.execute(text(
        "SELECT name, current_work_orders, max_work_orders FROM technicians "
        "WHERE hotel_id=:hotel_id AND is_active=true "
        "AND current_work_orders >= max_work_orders * 0.9"
    ), h).fetchall()
    for t in overloaded:
        signals.append({"id":"S002","level":"high","title":f"Technician {t[0]} at capacity ({t[1]}/{t[2]} jobs)",
            "action":"Redistribute work orders","endpoint":"/operations/dispatch"})

    # Signal 3: Overdue PM plans
    overdue_pm = db.execute(text(
        "SELECT count(*) FROM maintenance_plans WHERE status='active' "
        "AND next_due_date < CURRENT_DATE::text"
    )).scalar() or 0
    if overdue_pm > 0:
        signals.append({"id":"S003","level":"high","title":f"{overdue_pm} PM plans overdue",
            "action":"Schedule maintenance immediately","endpoint":"/maintenance/schedule"})

    # Signal 4: Low stock items
    low_stock = db.execute(text(
        "SELECT count(*) FROM inventory_items i "
        "LEFT JOIN stock_balances s ON s.item_id=i.id "
        "WHERE i.hotel_id=:hotel_id AND COALESCE(s.qty_available,0) < COALESCE(i.min_stock,0)"
    ), h).scalar() or 0
    if low_stock > 0:
        signals.append({"id":"S004","level":"medium","title":f"{low_stock} inventory items below minimum stock",
            "action":"Create purchase requests","endpoint":"/supply-chain/inventory"})

    # Signal 5: Expiring contracts
    expiring = db.execute(text(
        "SELECT count(*) FROM contracts WHERE hotel_id=:hotel_id AND status='active' "
        "AND end_date IS NOT NULL AND end_date < NOW() + INTERVAL '30 days'"
    ), h).scalar() or 0
    if expiring > 0:
        signals.append({"id":"S005","level":"high","title":f"{expiring} contracts expiring in 30 days",
            "action":"Start renewal pipeline","endpoint":"/executive/portfolio"})

    # Signal 6: Pending approvals
    pending_q = db.execute(text(
        "SELECT count(*) FROM quotes WHERE hotel_id=:hotel_id AND status IN ('review','sent')"
    ), h).scalar() or 0
    pending_pr = db.execute(text(
        "SELECT count(*) FROM purchase_requests WHERE hotel_id=:hotel_id AND status IN ('draft','pending')"
    ), h).scalar() or 0
    total_pending = pending_q + pending_pr
    if total_pending > 0:
        signals.append({"id":"S006","level":"medium","title":f"{total_pending} items pending approval",
            "action":"Review and approve","endpoint":"/approvals"})

    # Signal 7: Unassigned critical WOs
    unassigned_crit = db.execute(text(
        "SELECT count(*) FROM work_orders WHERE hotel_id=:hotel_id "
        "AND technician_id IS NULL AND priority IN ('critical','high') AND status='open'"
    ), h).scalar() or 0
    if unassigned_crit > 0:
        signals.append({"id":"S007","level":"critical","title":f"{unassigned_crit} high-priority WOs unassigned",
            "action":"Dispatch technicians now","endpoint":"/operations/dispatch"})

    signals.sort(key=lambda s: {"critical":0,"high":1,"medium":2,"low":3}.get(s["level"],3))

    return {
        "signals": signals,
        "total": len(signals),
        "critical": sum(1 for s in signals if s["level"]=="critical"),
        "high": sum(1 for s in signals if s["level"]=="high"),
        "generated_at": datetime.datetime.utcnow().isoformat()
    }
