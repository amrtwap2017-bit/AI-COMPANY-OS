from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from typing import Optional
import json, requests, uuid, datetime
from datetime import datetime as _dt

router = APIRouter(prefix="/ai", tags=["ai-assistant"])

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2.5-coder:7b"

WORK_TYPE_MAP = {
    "hvac": ["hvac","chiller","ac","air","cooling","مكيف","تكييف","برودة"],
    "electrical": ["electrical","electric","power","lighting","generator","كهرباء","كهربي"],
    "plumbing": ["plumbing","water","pipe","leak","pump","سباكة","ماء","تسريب"],
    "mechanical": ["mechanical","elevator","lift","escalator","pump","ميكانيكي","مصعد"],
    "civil": ["civil","crack","ceiling","wall","roof","مدني","سقف","جدار"],
    "fire": ["fire","smoke","sprinkler","alarm","حريق","دخان"],
    "it": ["it","network","server","cctv","bms","شبكة"],
    "cleaning": ["pool","chemical","cleaning","نظافة","مسبح"],
}

PRIORITY_MAP = {
    "critical":  ["emergency","critical","urgent","danger","طارئ","عاجل","خطر","immediately"],
    "high":      ["broken","not working","failed","stopped","عطل","معطل","توقف","asap"],
    "medium":    ["issue","problem","noise","leak","مشكلة","ضوضاء"],
    "low":       ["check","inspect","service","فحص","صيانة"],
}

def detect_type(text: str) -> str:
    text_lower = text.lower()
    for wtype, keywords in WORK_TYPE_MAP.items():
        if any(kw in text_lower for kw in keywords):
            return wtype
    return "corrective"

def detect_priority(text: str) -> str:
    text_lower = text.lower()
    for priority, keywords in PRIORITY_MAP.items():
        if any(kw in text_lower for kw in keywords):
            return priority
    return "medium"

def extract_location(text: str) -> str:
    import re
    room = re.search(r"room\s*(\d+)|غرفة\s*(\d+)", text, re.IGNORECASE)
    floor = re.search(r"floor\s*(\d+)|دور\s*(\d+)", text, re.IGNORECASE)
    if room: return "Room " + (room.group(1) or room.group(2))
    if floor: return "Floor " + (floor.group(1) or floor.group(2))
    for loc in ["lobby","pool","restaurant","gym","spa","rooftop","parking","garden","اللوبي","المسبح"]:
        if loc in text.lower(): return loc.title()
    return "Main Building"

def call_ollama(prompt: str) -> str:
    """Legacy direct call — preserved for compatibility."""
    try:
        r = requests.post(OLLAMA_URL,
            json={"model": MODEL, "stream": False, "prompt": prompt,
                  "options": {"temperature": 0.1, "num_predict": 200}},
            timeout=30)
        return r.json().get("response", "")
    except Exception:
        return ""


def _call_ai_gateway(prompt: str, hotel_id: str, db, purpose: str = "service_request_triage") -> str:
    """
    Call AI through the governed AIGateway — T-021.
    Falls back to direct Ollama if gateway unavailable.
    Always audited. Always tenant-scoped.
    """
    try:
        from src.commercial.ai_gateway.gateway import AIGateway, AIRequest
        gw = AIGateway(db=db, hotel_id=hotel_id)
        req = AIRequest(
            hotel_id=hotel_id,
            purpose=purpose,
            prompt=prompt,
            model="qwen2.5:7b",
            max_tokens=200,
            temperature=0.1,
        )
        resp = gw.request(req)
        if resp.success and resp.content:
            return resp.content
        return call_ollama(prompt)
    except Exception:
        return call_ollama(prompt)


@router.post("/intake/request", summary="Parse incoming request to work order")
def intake_request(
    request: dict,
    hotel_id: Optional[str] = "tb-default-hotel-000000000001",
    db: Session = Depends(get_db),
):
    raw_text = request.get("text", "")
    if not raw_text:
        return {"error": "text field required"}

    work_type = detect_type(raw_text)
    priority  = detect_priority(raw_text)
    location  = extract_location(raw_text)

    # Use Ollama to generate clean title
    prompt = f"""Extract a clean work order title (max 10 words) from this maintenance request.
Request: {raw_text}
Reply with ONLY the title, nothing else."""
    title = _call_ai_gateway(prompt, hotel_id=hotel_id, db=db, purpose="service_request_triage").strip().strip('"').strip(".")
    if not title or len(title) > 100:
        title = raw_text[:80]

    # Find matching assets
    type_to_category = {
        "hvac": "HVAC", "electrical": "Electrical",
        "plumbing": "Plumbing", "mechanical": "Mechanical",
        "civil": "Civil", "fire": "Fire"
    }
    asset_category = type_to_category.get(work_type, "")
    matched_asset = None
    if asset_category:
        row = db.execute(text(
            "SELECT id, name FROM assets WHERE hotel_id=:h AND category=:c "
            "AND (location_description ILIKE :loc OR :loc2 ILIKE '%' || location_description || '%') "
            "LIMIT 1"
        ), {"h": hotel_id, "c": asset_category, "loc": "%" + location + "%", "loc2": location}).fetchone()
        if row:
            matched_asset = {"id": row[0], "name": row[1]}

    result = {
        "parsed": {
            "title":    title,
            "type":     work_type,
            "priority": priority,
            "location": location,
            "hotel_id": hotel_id,
        },
        "matched_asset": matched_asset,
        "raw_text": raw_text,
        "ready_to_create": True,
        "work_order_payload": {
            "hotel_id":    hotel_id,
            "title":       title,
            "type":        work_type,
            "priority":    priority,
            "status":      "open",
            "description": raw_text,
            "asset_id":    matched_asset["id"] if matched_asset else None,
        }
    }
    return result

@router.post("/intake/create-wo", summary="Create work order from parsed request")
def create_wo_from_intake(payload: dict, db: Session = Depends(get_db)):
    wo_id = str(uuid.uuid4())
    now   = _dt.utcnow()
    db.execute(text(
        "INSERT INTO work_orders (id, hotel_id, title, type, priority, status, description, asset_id, created_at, updated_at) "
        "VALUES (:id, :hotel_id, :title, :type, :priority, :status, :description, :asset_id, :created_at, :updated_at)"
    ), {
        "id":          wo_id,
        "hotel_id":    payload.get("hotel_id", "tb-default-hotel-000000000001"),
        "title":       payload.get("title", "New Work Order"),
        "type":        payload.get("type", "corrective"),
        "priority":    payload.get("priority", "medium"),
        "status":      "open",
        "description": payload.get("description", ""),
        "asset_id":    payload.get("asset_id"),
        "created_at":  now,
        "updated_at":  now,
    })
    db.commit()
    return {"work_order_id": wo_id, "status": "created", "title": payload.get("title")}
