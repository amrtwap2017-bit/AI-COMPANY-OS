"""
Stripe Billing Router — Triangle Black SaaS v6.0
"""
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.billing.service import StripeBillingService

router = APIRouter(prefix="/billing", tags=["Stripe Subscription Billing"])

@router.post("/checkout-session")
def create_checkout_session_endpoint(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Creates a simulated Stripe Checkout Session for plan upgrades."""
    plan_id = payload.get("plan_id", "intelligence")
    service = StripeBillingService(db=db, hotel_id=hotel_id)
    return service.create_checkout_session(plan_id)

@router.get("/stripe-success")
def stripe_success_callback_endpoint(
    session_id: str = Query(...),
    hotel_id: str = Query(...),
    plan_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Simulated Stripe success callback — processes upgrade and redirects."""
    service = StripeBillingService(db=db, hotel_id=hotel_id)
    payload = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "metadata": {"hotel_id": hotel_id, "plan_id": plan_id}
            }
        }
    }
    service.process_webhook_event(payload)
    # Redirect back to onboarding success page or workspace dashboard
    return RedirectResponse(url=f"http://localhost:3000/login?status=success&plan={plan_id}")

@router.post("/webhook")
def stripe_webhook_endpoint(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    """Receives production events from Stripe Webhook API."""
    service = StripeBillingService(db=db, hotel_id="tb-default-hotel-000000000001")
    return service.process_webhook_event(payload)
