from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from typing import Optional, List
import json

router = APIRouter(prefix="/ai", tags=["ai-dispatch"])

SPEC_MAP = {
    "hvac":        ["HVAC","Refrigeration","Chiller","Cooling","VRF","AHU"],
    "electrical":  ["Electrical","Generator","UPS","Lighting","MV/LV"],
    "plumbing":    ["Plumbing","Pumps","Water","Fire Fighting"],
    "mechanical":  ["Mechanical","Elevators","Pumps","Compressors"],
    "civil":       ["Civil","Finishing","Waterproofing","Roofing"],
    "fire":        ["Fire Alarm","Safety"],
    "it":          ["IT","BMS","Access Control"],
    "cleaning":    ["Pool","Cleaning"],
}

INV_CATEGORY_MAP = {
    "hvac":        ["HVAC Parts","HVAC","Refrigerant","Chemicals"],
    "electrical":  ["Electrical"],
    "plumbing":    ["Plumbing","Pool Parts"],
    "mechanical":  ["Mechanical","Elevators"],
    "fire":        ["Fire Safety"],
    "cleaning":    ["Pool Chem","Consumables"],
}

def technician_score(tech: dict, wo_type: str, priority: str, hotel_id: str) -> float:
    specializations = tech.get("specializations") or []
    if isinstance(specializations, str):
        try: specializations = json.loads(specializations)
        except: specializations = []
    target_specs = SPEC_MAP.get(wo_type, [])
    spec_match = 1.0 if any(s in target_specs for s in specializations) else 0.0
    max_wo  = tech.get("max_work_orders", 10) or 10
    cur_wo  = tech.get("current_work_orders", 0) or 0
    capacity = max(0, (max_wo - cur_wo) / max_wo)
    hotel_match = 1.0 if tech.get("hotel_id") == hotel_id else 0.5
    score = spec_match * 0.4 + capacity * 0.3 + hotel_match * 0.3
    if priority in ("critical", "emergency") and spec_match > 0:
        score += 0.2
    return round(score, 3)

@router.post("/dispatch/recommend", summary="Recommend best technician for work order")
def recommend_technician(
    work_order_type: str,
    priority: str = "medium",
    hotel_id: str = "tb-default-hotel-000000000001",
    db: Session = Depends(get_db),
):
    techs = [dict(r._mapping) for r in db.execute(text(
        "SELECT id, name, specializations, max_work_orders, current_work_orders, hotel_id "
        "FROM technicians WHERE is_active=true"
    )).fetchall()]

    if not techs:
        raise HTTPException(404, "No active technicians")

    # Emergency: any available technician
    if priority == "emergency":
        available = [t for t in techs if (t.get("current_work_orders") or 0) < (t.get("max_work_orders") or 10)]
        if available:
            return {"recommended_technician_id": available[0]["id"],
                    "name": available[0]["name"],
                    "reason": "Emergency - first available",
                    "score": 1.0, "alternatives": []}

    scored = [(t, technician_score(t, work_order_type, priority, hotel_id)) for t in techs]
    scored.sort(key=lambda x: x[1], reverse=True)

    best = scored[0]
    alts = [{"id": t["id"], "name": t["name"], "score": s} for t, s in scored[1:4]]

    return {
        "recommended_technician_id": best[0]["id"],
        "name": best[0]["name"],
        "score": best[1],
        "reason": f"Best match for {work_order_type} (score: {best[1]})",
        "alternatives": alts,
    }

@router.post("/inventory/check", summary="Check inventory for work order requirements")
def check_inventory(
    work_order_type: str,
    hotel_id: str = "tb-default-hotel-000000000001",
    description: str = "",
    db: Session = Depends(get_db),
):
    categories = INV_CATEGORY_MAP.get(work_order_type, [])
    available = []
    missing   = []

    for cat in categories:
        items = db.execute(text(
            "SELECT i.id, i.name, i.item_code, i.category, i.min_stock, "
            "COALESCE(s.quantity, 0) as stock "
            "FROM inventory_items i "
            "LEFT JOIN stock_balances s ON s.item_id=i.id "
            "WHERE i.hotel_id=:h AND i.category ILIKE :cat LIMIT 5"
        ), {"h": hotel_id, "cat": "%" + cat + "%"}).fetchall()
        for row in items:
            r = dict(row._mapping)
            if r["stock"] > r["min_stock"]:
                available.append({"id": r["id"], "name": r["name"], "stock": r["stock"], "category": r["category"]})
            else:
                missing.append({"id": r["id"], "name": r["name"], "stock": r["stock"], "min_stock": r["min_stock"], "category": r["category"]})

    # Suggest vendors for missing items
    vendors = []
    if missing:
        for cat in categories:
            vendor_rows = db.execute(text(
                "SELECT id, name, category, phone, email, lead_time_days "
                "FROM inventory_vendors WHERE hotel_id=:h AND category ILIKE :cat LIMIT 3"
            ), {"h": hotel_id, "cat": "%" + cat + "%"}).fetchall()
            vendors.extend([dict(r._mapping) for r in vendor_rows])

    return {
        "work_order_type": work_order_type,
        "items_available": available,
        "items_missing":   missing,
        "stock_sufficient": len(missing) == 0,
        "vendors_suggested": vendors[:5],
        "action_required": "create_pr" if missing else "proceed_to_dispatch",
    }
