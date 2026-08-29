"""
V6-E02 — Evidence/Recommendation Framework Router
Closes: Intelligence → Decision → Measurement loop.

POST /recommendations/generate   → run all 4 directors, store results
GET  /recommendations             → list pending (prioritized by risk)
GET  /recommendations/summary     → dashboard summary
GET  /recommendations/history     → approved/rejected history
GET  /recommendations/{id}        → full recommendation with evidence
POST /recommendations/{id}/approve → human approves
POST /recommendations/{id}/reject  → human rejects
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.recommendations.service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


def _svc(db: Session = Depends(get_db),
         hotel_id: str = Depends(get_hotel_id)) -> RecommendationService:
    return RecommendationService(db=db, hotel_id=hotel_id)


@router.post("/generate")
def generate_recommendations(
    current_user=Depends(get_current_user),
    service: RecommendationService = Depends(_svc),
):
    """
    Run all 4 AI Directors and persist their recommendations.
    Returns list of generated recommendation IDs.
    Requires human review before any action is taken.
    """
    return service.generate_from_directors()


@router.get("/summary")
def recommendations_summary(
    current_user=Depends(get_current_user),
    service: RecommendationService = Depends(_svc),
):
    """Dashboard summary: total, pending, approved, rejected, critical_pending."""
    return service.get_summary()


@router.get("/history")
def recommendations_history(
    limit: int = Query(default=20, ge=1, le=100),
    current_user=Depends(get_current_user),
    service: RecommendationService = Depends(_svc),
):
    """Reviewed recommendations history (approved + rejected)."""
    return service.get_history(limit)


@router.get("")
@router.get("/")
def list_recommendations(
    status: str = Query(default=None,
                        description="Filter by: pending | approved | rejected"),
    limit: int = Query(default=20, ge=1, le=100),
    current_user=Depends(get_current_user),
    service: RecommendationService = Depends(_svc),
):
    """
    List recommendations, prioritized by risk level.
    Omit status to see all. Use status=pending for action queue.
    """
    return service.list_recommendations(status=status, limit=limit)


@router.get("/{rec_id}")
def get_recommendation(
    rec_id: str,
    current_user=Depends(get_current_user),
    service: RecommendationService = Depends(_svc),
):
    """Full recommendation with complete evidence chain and source data."""
    rec = service.get_recommendation(rec_id)
    if not rec:
        raise HTTPException(
            status_code=404,
            detail=f"Recommendation {rec_id} not found for this hotel"
        )
    return rec


@router.post("/{rec_id}/approve")
def approve_recommendation(
    rec_id: str,
    payload: dict = None,
    current_user=Depends(get_current_user),
    service: RecommendationService = Depends(_svc),
):
    """
    Human approves recommendation.
    Records the decision — does NOT automatically execute any action.
    Execution is a separate, deliberate human step.
    """
    payload = payload or {}
    reviewer = getattr(current_user, "email", "system")
    notes = payload.get("notes", "")
    return service.approve_recommendation(rec_id, reviewer, notes)


@router.post("/{rec_id}/reject")
def reject_recommendation(
    rec_id: str,
    payload: dict = None,
    current_user=Depends(get_current_user),
    service: RecommendationService = Depends(_svc),
):
    """Human rejects recommendation with reason."""
    payload = payload or {}
    reviewer = getattr(current_user, "email", "system")
    reason = payload.get("reason", "Rejected by reviewer")
    return service.reject_recommendation(rec_id, reviewer, reason)
