"""
AI Advisory Directors Router — Triangle Black V6-E01
Governed advisory workflow — all outputs require human review before action.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.ai_directors.service import AIDirectorsService

router = APIRouter(prefix="/ai-directors", tags=["AI Advisory Directors"])


def _svc(db: Session = Depends(get_db),
         hotel_id: str = Depends(get_hotel_id)) -> AIDirectorsService:
    return AIDirectorsService(db=db, hotel_id=hotel_id)


@router.post("/analyze")
def analyze_director(
    payload: dict,
    current_user=Depends(get_current_user),
    service: AIDirectorsService = Depends(_svc),
):
    """
    Execute a governed analytical assessment from the specified AI Director.
    director: maintenance | procurement | operations | executive
    All outputs are advisory — human review required before action.
    """
    director_type = payload.get("director", "executive")
    context = payload.get("context", {})
    if isinstance(context, str):
        context = {}
    return service.analyze_director(director_type, context)


@router.get("/maintenance")
def maintenance_director(
    current_user=Depends(get_current_user),
    service: AIDirectorsService = Depends(_svc),
):
    """AI Maintenance Director — evidence-backed maintenance advisory."""
    return service.analyze_director("maintenance", {})


@router.get("/procurement")
def procurement_director(
    current_user=Depends(get_current_user),
    service: AIDirectorsService = Depends(_svc),
):
    """AI Procurement Director — procurement intelligence advisory."""
    return service.analyze_director("procurement", {})


@router.get("/operations")
def operations_director(
    current_user=Depends(get_current_user),
    service: AIDirectorsService = Depends(_svc),
):
    """AI Operations Director — operational performance advisory."""
    return service.analyze_director("operations", {})


@router.get("/executive")
def executive_director(
    current_user=Depends(get_current_user),
    service: AIDirectorsService = Depends(_svc),
):
    """AI Executive Analyst — cross-domain executive summary."""
    return service.analyze_director("executive", {})


@router.get("/all")
def all_directors(
    current_user=Depends(get_current_user),
    service: AIDirectorsService = Depends(_svc),
):
    """Run all 4 AI Directors in sequence. Returns combined advisory output."""
    return {
        "hotel_id": service.hotel_id,
        "directors": {
            "maintenance": service.analyze_director("maintenance", {}),
            "procurement": service.analyze_director("procurement", {}),
            "operations": service.analyze_director("operations", {}),
            "executive": service.analyze_director("executive", {}),
        },
        "governance_note": (
            "All director outputs are advisory. "
            "Human review and approval required before any action is taken."
        ),
    }
