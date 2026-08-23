"""
Customer Feedback Router — Triangle Black Commercial v5.4
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.feedback.service import FeedbackService

router = APIRouter(prefix="/feedback", tags=["Customer Feedback & Triage"])

@router.post("/submit")
def submit_feedback_endpoint(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Submits customer feedback with automated priority assignment."""
    service = FeedbackService(db=db, hotel_id=hotel_id)
    result = service.submit_feedback(payload)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Submission failed"))
    return result

@router.get("/list")
def list_feedback_endpoint(
    status: str = None,
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Lists feedback records for the current tenant."""
    service = FeedbackService(db=db, hotel_id=hotel_id)
    return service.list_feedback(status=status)

@router.patch("/{feedback_id}/triage")
def triage_feedback_endpoint(
    feedback_id: str,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Updates priority classification (P0-P4) and resolution status."""
    priority = payload.get("priority", "P2")
    status = payload.get("status", "in_triage")
    notes = payload.get("notes")

    service = FeedbackService(db=db, hotel_id=hotel_id)
    result = service.triage_feedback(feedback_id=feedback_id, priority=priority, status=status, notes=notes)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Triage update failed"))
    return result
