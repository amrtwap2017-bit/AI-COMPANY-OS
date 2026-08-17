"""AI Gateway router — T-010"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.ai_gateway.gateway import AIGateway, AIRequest

router = APIRouter(prefix="/api/v1/ai-gateway", tags=["AI Gateway"])


@router.get("/registry")
def get_ai_registry(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """Return AI model registry and allowed purposes."""
    gw = AIGateway(db=db, hotel_id=hotel_id)
    return gw.get_registry()


@router.post("/request")
def submit_ai_request(
    data: dict,
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """Submit a governed AI request through the gateway."""
    gw = AIGateway(db=db, hotel_id=hotel_id)
    req = AIRequest(
        hotel_id=hotel_id,
        purpose=data.get("purpose", "general_assistance"),
        prompt=data.get("prompt", ""),
        model=data.get("model", "qwen2.5:7b"),
        actor=data.get("actor"),
        max_tokens=int(data.get("max_tokens", 500)),
    )
    response = gw.request(req)
    return {
        "request_id": response.request_id,
        "hotel_id": response.hotel_id,
        "purpose": response.purpose,
        "model": response.model,
        "content": response.content,
        "success": response.success,
        "latency_ms": response.latency_ms,
        "cost_estimate_usd": response.cost_estimate_usd,
        "error": response.error,
        "audit_id": response.audit_id,
    }
