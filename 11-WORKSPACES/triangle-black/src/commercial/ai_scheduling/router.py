from __future__ import annotations
import json as _json
import datetime
from datetime import datetime as _dt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/ai-scheduling", tags=["ai-scheduling"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _parse_specializations(raw):
    if not raw: return []
    if isinstance(raw, list): return [s.lower() for s in raw]
    try:
        return [s.lower() for s in _json.loads(raw)]
    except Exception:
        return [s.strip().lower() for s in str(raw).split(",") if s.strip()]

@router.get("/capacity", summary="Technician capacity overview")
def get_capacity(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("""
            SELECT id, name, specializations, max_work_orders,
                   current_work_orders, hotel_id, is_active
            FROM technicians
            WHERE is_active = true
              AND hotel_id = :hotel_id
            ORDER BY current_work_orders ASC
        """)).fetchall()
    except Exception:
        rows = []

    technicians = []
    total_slots = 0
    at_capacity = 0

    for row in rows:
        t = row_to_dict(row)
        mx  = int(t.get("max_work_orders") or 5)
        cur = int(t.get("current_work_orders") or 0)
        util = round(cur / mx * 100, 1) if mx > 0 else 100.0
        slots = max(0, mx - cur)
        total_slots += slots
        if util >= 100: at_capacity += 1
        technicians.append({
            "id":             t.get("id"),
            "name":           t.get("name"),
            "current":        cur,
            "max":            mx,
            "utilization_pct": util,
            "available_slots": slots,
            "hotel_id":       t.get("hotel_id"),
        })

    return {
        "technicians": technicians,
        "summary": {
            "total_technicians": len(technicians),
            "at_capacity":       at_capacity,
            "available":         len(technicians) - at_capacity,
            "total_open_slots":  total_slots,
        },
        "generated_at": _dt.utcnow().isoformat(),
    }

@router.post("/recommend-dispatch", summary="AI dispatch recommendation")
def recommend_dispatch(data: dict, hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db)):
    wo_type   = (data.get("work_order_type") or data.get("type") or "").lower()
    priority  = (data.get("priority") or "medium").lower()

    try:
        techs = db.execute(text("""
            SELECT id, name, specializations, max_work_orders,
                   current_work_orders, hotel_id
            FROM technicians
            WHERE is_active = true
              AND current_work_orders < max_work_orders
        """)).fetchall()
    except Exception:
        return {"recommended": None, "alternatives": [],
                "message": "No available technicians"}

    scored = []
    for row in techs:
        t = row_to_dict(row)
        specs    = _parse_specializations(t.get("specializations"))
        mx       = int(t.get("max_work_orders") or 5)
        cur      = int(t.get("current_work_orders") or 0)

        spec_match  = 1.0 if wo_type in specs else 0.0
        cap_score   = (mx - cur) / mx if mx > 0 else 0.0
        hotel_match = 1.0 if str(t.get("hotel_id")) == str(hotel_id) else 0.0

        score = spec_match * 0.4 + cap_score * 0.3 + hotel_match * 0.3

        reasons = []
        if spec_match: reasons.append(f"specializes in {wo_type}")
        if hotel_match: reasons.append("same hotel")
        if cap_score > 0.5: reasons.append(f"{mx-cur} slots available")

        scored.append({
            "technician_id": t.get("id"),
            "name":          t.get("name"),
            "score":         round(score, 3),
            "reason":        " + ".join(reasons) or "available",
            "utilization":   round(cur/mx*100, 1) if mx else 100,
        })

    scored.sort(key=lambda x: x["score"], reverse=True)

    if not scored:
        return {"recommended": None, "alternatives": [],
                "message": "All technicians at capacity"}

    return {
        "recommended":  scored[0],
        "alternatives": scored[1:4],
        "wo_type":      wo_type,
        "priority":     priority,
        "message":      f"Best match: {scored[0]['name']} (score: {scored[0]['score']})",
    }

@router.get("/daily-plan", summary="Daily operations plan for hotel")
def daily_plan(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db)):
    today = datetime.date.today()

    try:
        open_wos = db.execute(text("""
            SELECT count(*) as total,
                   sum(CASE WHEN priority='critical' AND technician_id IS NULL THEN 1 ELSE 0 END) as unassigned_critical
            FROM work_orders
            WHERE hotel_id = :hotel_id
              AND status IN ('open','assigned','in_progress')
        """), {"hotel_id": hotel_id}).fetchone()
        wo_data = row_to_dict(open_wos)
    except Exception:
        wo_data = {"total": 0, "unassigned_critical": 0}

    try:
        techs = db.execute(text("""
            SELECT t.id, t.name, t.max_work_orders, t.current_work_orders
            FROM technicians t
            WHERE t.hotel_id = :hotel_id AND t.is_active = true
        """), {"hotel_id": hotel_id}).fetchall()
        tech_list = []
        for row in techs:
            t = row_to_dict(row)
            mx  = int(t.get("max_work_orders") or 5)
            cur = int(t.get("current_work_orders") or 0)
            tech_list.append({
                "name": t.get("name"),
                "assigned_wos": cur,
                "capacity_pct": round(cur/mx*100, 1) if mx else 100,
            })
    except Exception:
        tech_list = []

    try:
        unassigned = db.execute(text("""
            SELECT id, title, priority FROM work_orders
            WHERE hotel_id = :hotel_id
              AND status = 'open'
              AND technician_id IS NULL
              AND priority = 'critical'
            LIMIT 10
        """), {"hotel_id": hotel_id}).fetchall()
        unassigned_list = [row_to_dict(r) for r in unassigned]
    except Exception:
        unassigned_list = []

    return {
        "date":                str(today),
        "hotel_id":            hotel_id,
        "open_work_orders":    int(wo_data.get("total") or 0),
        "technicians":         tech_list,
        "unassigned_critical": unassigned_list,
        "generated_at":        _dt.utcnow().isoformat(),
    }
