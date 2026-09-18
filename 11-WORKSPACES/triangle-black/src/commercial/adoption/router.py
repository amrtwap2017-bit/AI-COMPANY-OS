"""Customer Adoption Intelligence Router — V15 P2."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user  # ALWAYS import

router = APIRouter(prefix="/adoption", tags=["adoption"])


@router.get("/health", summary="Customer adoption health score")
def get_adoption_health(
    days: int = 7,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Pilot adoption health: 0-100 score.
    Answers: 'Is the engineering team actually using Triangle Black?'
    Critical for V15 pilot management.
    """
    from src.commercial.adoption.service import AdoptionService
    svc = AdoptionService(db=db, hotel_id=hotel_id)
    return svc.get_adoption_health(days=days)


@router.post("/event", summary="Record adoption event")
def record_adoption_event(
    payload: dict,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Record a user action for adoption tracking.
    Called by frontend on key actions: login, WO created, rec approved, etc.
    Non-blocking — failure never interrupts user operations.
    """
    from src.commercial.adoption.service import AdoptionService
    svc = AdoptionService(db=db, hotel_id=hotel_id)
    user_id = getattr(current_user, "id",
                getattr(current_user, "sub", str(current_user)))
    success = svc.record_event(
        event_type=payload.get("event_type", "PAGE_VIEW"),
        user_id=str(user_id),
        entity_type=payload.get("entity_type"),
        entity_id=payload.get("entity_id"),
        metadata=payload.get("metadata"),
    )
    return {"recorded": success}
