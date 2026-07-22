from __future__ import annotations
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from fastapi import Depends
from pydantic import BaseModel
from typing import Optional, List
import json

router = APIRouter(prefix="/ai", tags=["ai-dispatch"])

SPEC_MAP = {
    "hvac":        ["HVAC", "Refrigeration", "Chiller", "Cooling", "VRF", "AHU"],
    "electrical":  ["Electrical", "Generator", "UPS", "Lighting", "MV/LV"],
    "plumbing":    ["Plumbing", "Pumps", "Water", "Fire Fighting"],
    "mechanical":  ["Mechanical", "Elevators", "Pumps", "Compressors"],
    "civil":       ["Civil", "Finishing", "Waterproofing", "Roofing"],
    "fire":        ["Fire Alarm", "Safety"],
    "it":          ["IT", "BMS", "Access Control"],
    "cleaning":    ["Pool", "Cleaning"],
}


class DispatchRequest(BaseModel):
    work_order_type: str
    priority: str
    hotel_id: str


def score_technician(tech: dict, work_order_type: str, priority: str, hotel_id: str) -> float:
    try:
        specs = tech.get("specializations") or []
        if isinstance(specs, str):
            specs = json.loads(specs)
    except Exception:
        specs = []

    target_keywords = SPEC_MAP.get(work_order_type.lower(), [work_order_type])
    specialization_match = 0.0
    for kw in target_keywords:
        if any(kw.lower() in s.lower() for s in specs):
            specialization_match = 1.0
            break

    max_wo = tech.get("max_work_orders") or 1
    cur_wo = tech.get("current_work_orders") or 0
    capacity_score = max(0.0, 1.0 - (cur_wo / max_wo))

    hotel_match = 1.0 if tech.get("hotel_id") == hotel_id else 0.5

    return round((specialization_match * 0.4) + (capacity_score * 0.3) + (hotel_match * 0.3), 4)


@router.post("/dispatch/recommend", summary="Recommend best technician for a work order")
def dispatch_recommend(body: DispatchRequest, db: Session = Depends(get_db)):
    try:
        rows = db.execute(text(
            "SELECT id, name, specializations, current_work_orders, "
            "max_work_orders, hotel_id FROM technicians "
            "WHERE is_active = true"
        )).fetchall()

        if not rows:
            return {
                "recommended": None,
                "alternatives": [],
                "warning": "no_technicians",
                "message": "No active technicians found in the system."
            }

        technicians = [dict(r._mapping) for r in rows]

        scored = []
        for tech in technicians:
            score = score_technician(tech, body.work_order_type, body.priority, body.hotel_id)
            if body.priority == "critical":
                specs = tech.get("specializations") or []
                if isinstance(specs, str):
                    try:
                        specs = json.loads(specs)
                    except Exception:
                        specs = []
                keywords = SPEC_MAP.get(body.work_order_type.lower(), [body.work_order_type])
                has_spec = any(kw.lower() in s.lower() for kw in keywords for s in specs)
                if not has_spec:
                    continue
            scored.append({
                "technician_id": tech["id"],
                "name": tech["name"],
                "score": score,
                "current_work_orders": tech["current_work_orders"],
                "max_work_orders": tech["max_work_orders"],
                "hotel_id": tech["hotel_id"],
                "reason": f"Score {score:.2f} — specialization + capacity + location match"
            })

        if not scored:
            scored = []
            for tech in technicians:
                score = score_technician(tech, body.work_order_type, body.priority, body.hotel_id)
                scored.append({
                    "technician_id": tech["id"],
                    "name": tech["name"],
                    "score": score,
                    "current_work_orders": tech["current_work_orders"],
                    "max_work_orders": tech["max_work_orders"],
                    "hotel_id": tech["hotel_id"],
                    "reason": "No specialist found — best available selected"
                })

        scored.sort(key=lambda x: x["score"], reverse=True)

        all_full = all(
            t.get("current_work_orders", 0) >= t.get("max_work_orders", 1)
            for t in technicians
        )

        no_specialist = not any(
            score_technician(t, body.work_order_type, body.priority, body.hotel_id) >= 0.4
            for t in technicians
        )

        warning = None
        if all_full:
            warning = "all_full"
        elif no_specialist:
            warning = "no_specialist"

        return {
            "recommended": scored[0] if scored else None,
            "alternatives": scored[1:4],
            "warning": warning,
            "total_technicians_evaluated": len(technicians),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
