"""
AI Advisory Directors Router — Triangle Black Enterprise OS v5.2
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.ai_directors.service import AIDirectorsService

router = APIRouter(prefix="/ai-directors", tags=["AI Advisory Directors"])

@router.post("/analyze")
def analyze_director_endpoint(
    payload: dict,
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Executes a governed analytical assessment from the specified AI Advisory Director."""
    director_type = payload.get("director", "executive")
    context = payload.get("context", {})
    service = AIDirectorsService(db=db, hotel_id=hotel_id)
    return service.analyze_director(director_type, context)
