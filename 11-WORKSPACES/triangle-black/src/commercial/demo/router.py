"""
Sprint 7 — Commercial Demo Router
GET /demo/story     → complete demo narrative
GET /demo/headline  → quick headline metrics for landing page
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.demo.service import CommercialDemoService

router = APIRouter(prefix="/demo", tags=["Demo"])


def _svc(db: Session = Depends(get_db),
         hotel_id: str = Depends(get_hotel_id)) -> CommercialDemoService:
    return CommercialDemoService(db=db, hotel_id=hotel_id)


@router.get("/story")
def get_demo_story(
    current_user=Depends(get_current_user),
    svc: CommercialDemoService = Depends(_svc),
):
    """
    Complete commercial demo narrative — 8 slides.
    Reads from live operational data.
    Used for sales presentations and prospect demos.
    """
    return svc.generate_story()


@router.get("/headline")
def get_demo_headline(
    current_user=Depends(get_current_user),
    svc: CommercialDemoService = Depends(_svc),
):
    """Quick headline metrics — health score, cost avoidance, top actions."""
    story = svc.generate_story()
    return {
        "hotel_id": story["hotel_id"],
        "headline_metrics": story["headline_metrics"],
        "top_3_actions": story["slides"]["slide_6_recommendation"]["top_actions"][:3],
        "cta": story["slides"]["slide_8_next_step"]["cta"],
        "generated_at": story["generated_at"],
    }
