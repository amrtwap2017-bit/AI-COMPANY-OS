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
from fastapi import APIRouter, Body, Depends, HTTPException, Query
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


@router.get("/action-queue", summary="Intelligence → Action Queue")
def get_action_queue(
    limit: int = 20,
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    service: RecommendationService = Depends(_svc),
):
    """
    V7-006: Intelligence → Action Queue.
    
    Returns pending recommendations ordered by business priority:
      P0 = Act today (CRITICAL risk)
      P1 = Act this week (HIGH risk)
      P2 = Act this month
      P3 = Plan
    
    Closes the intelligence loop:
    Signal → Evidence → Recommendation → ACTION → Outcome → Learning
    
    All actions require human approval. This is advisory only.
    """
    return service.get_action_queue(hotel_id=hotel_id, limit=limit)

@router.get("/effectiveness",
            summary="AI Recommendation Effectiveness Metrics")
def get_recommendation_effectiveness(
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    service: RecommendationService = Depends(_svc),
):
    """
    How accurate and effective are the AI recommendations?
    Acceptance rate, outcome distribution, effectiveness rate, by director.
    MUST be registered before /{rec_id} to prevent route shadowing.
    """
    return service.get_effectiveness(hotel_id=hotel_id)

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

@router.post("/{recommendation_id}/outcome",
             summary="Record recommendation outcome")
def record_recommendation_outcome(
    recommendation_id: str,
    payload: dict = Body(...),
    hotel_id: str = Depends(get_hotel_id),
    current_user=Depends(get_current_user),
    service: RecommendationService = Depends(_svc),
):
    """
    Record what happened after an approved recommendation was acted upon.
    outcome_type: improved | unchanged | worse | unknown
    """
    return service.record_outcome(
        recommendation_id=recommendation_id,
        hotel_id=hotel_id,
        outcome_type=payload.get("outcome_type", "unknown"),
        metric_key=payload.get("metric_key"),
        metric_before=payload.get("metric_before"),
        metric_after=payload.get("metric_after"),
        notes=payload.get("notes"),
        recorded_by=getattr(current_user, "email", None) or "unknown",
    )

