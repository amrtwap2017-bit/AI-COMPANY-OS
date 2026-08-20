"""
T-010: AI Gateway Router
All AI endpoints go through the governed AIGateway.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.ai_gateway.gateway import AIGateway
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

router = APIRouter(prefix="/ai-gateway", tags=["AI Gateway"])


class AIRequest(BaseModel):
    purpose: str
    context: Dict[str, Any] = {}
    model: str = "default"
    prompt: Optional[str] = None
    evidence: Optional[List[Dict]] = None
    max_cost_usd: float = 1.0


class MaintenanceAIRequest(BaseModel):
    asset_id: Optional[str] = None
    work_order_id: Optional[str] = None
    symptoms: Optional[str] = None
    history_days: int = 30


@router.post("/request")
def make_ai_request(
    req: AIRequest,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Generic governed AI request endpoint.
    All AI calls are audited, cost-tracked and tenant-scoped.
    """
    gateway = AIGateway(db=db, hotel_id=hotel_id)
    return gateway.request(
        purpose=req.purpose,
        context=req.context,
        model=req.model,
        prompt=req.prompt,
        evidence=req.evidence,
        max_cost_usd=req.max_cost_usd,
    )


@router.post("/maintenance-recommendation")
def get_maintenance_recommendation(
    req: MaintenanceAIRequest,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    AI maintenance recommendation for an asset or work order.
    Uses local model by default — governed, audited, cost-tracked.
    """
    from sqlalchemy import text as _text

    context: Dict[str, Any] = {
        "hotel_id": hotel_id,
        "request_type": "maintenance_recommendation",
    }

    # Fetch asset context if provided
    if req.asset_id:
        try:
            row = db.execute(_text("""
                SELECT id, name, category, status, criticality
                FROM assets
                WHERE id = :id AND hotel_id = :hid
            """), {"id": req.asset_id, "hid": hotel_id}).fetchone()
            if row:
                context["asset"] = dict(row._mapping)
        except Exception:
            pass

    # Fetch recent work orders
    try:
        rows = db.execute(_text("""
            SELECT id, title, status, priority, type, created_at
            FROM work_orders
            WHERE hotel_id = :hid
            AND (asset_id = :asset_id OR :asset_id IS NULL)
            ORDER BY created_at DESC LIMIT 5
        """), {"hid": hotel_id, "asset_id": req.asset_id}).fetchall()
        context["recent_work_orders"] = [dict(r._mapping) for r in rows]
    except Exception:
        context["recent_work_orders"] = []

    if req.symptoms:
        context["reported_symptoms"] = req.symptoms

    gateway = AIGateway(db=db, hotel_id=hotel_id)
    return gateway.request(
        purpose="maintenance_recommendation",
        context=context,
        model="default",
    )


@router.post("/work-order-summary")
def get_work_order_summary(
    wo_id: str,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """AI-generated summary of a work order."""
    from sqlalchemy import text as _text

    context: Dict[str, Any] = {"work_order_id": wo_id, "hotel_id": hotel_id}

    try:
        row = db.execute(_text("""
            SELECT id, title, description, status, priority, type,
                   created_at, updated_at, sla_status, sla_hours
            FROM work_orders
            WHERE id = :id AND hotel_id = :hid
        """), {"id": wo_id, "hid": hotel_id}).fetchone()
        if row:
            context["work_order"] = dict(row._mapping)
    except Exception:
        pass

    gateway = AIGateway(db=db, hotel_id=hotel_id)
    return gateway.request(
        purpose="work_order_summary",
        context=context,
    )


@router.get("/models")
def list_available_models(
    hotel_id: str = Depends(get_hotel_id),
):
    """List available AI models for this tenant."""
    return {
        "hotel_id": hotel_id,
        "models": [
            {"id": k, **{kk: vv for kk, vv in v.items() if kk != "endpoint"}}
            for k, v in AIGateway.AVAILABLE_MODELS.items()
        ],
        "default_model": "default",
    }


@router.get("/purposes")
def list_allowed_purposes(
    hotel_id: str = Depends(get_hotel_id),
):
    """List allowed AI request purposes."""
    return {
        "hotel_id": hotel_id,
        "purposes": sorted(AIGateway.ALLOWED_PURPOSES),
    }

@router.get("/registry")
def get_ai_registry(hotel_id: str = Depends(get_hotel_id)):
    """Compatibility registry endpoint."""
    return {
        "models": ["qwen2.5:7b", "default"],
        "purposes": sorted(AIGateway.ALLOWED_PURPOSES),
        "hotel_id": hotel_id,
    }
