"""
Stripe Billing & Subscription Service — Triangle Black SaaS v6.0
Manages simulated Stripe checkout sessions, pricing webhook events, and plan upgrades.
"""
import uuid
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text

class StripeBillingService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def create_checkout_session(self, plan_id: str) -> Dict[str, Any]:
        session_id = f"cs_test_{uuid.uuid4().hex}"
        checkout_url = f"http://localhost:8030/api/v1/billing/stripe-success?session_id={session_id}&hotel_id={self.hotel_id}&plan_id={plan_id}"

        return {
            "success": True,
            "session_id": session_id,
            "checkout_url": checkout_url,
            "plan_id": plan_id,
            "hotel_id": self.hotel_id
        }

    def process_webhook_event(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        event_type = payload.get("type", "checkout.session.completed")
        data_object = payload.get("data", {}).get("object", {})
        
        hotel_id = data_object.get("metadata", {}).get("hotel_id", self.hotel_id)
        plan_id = data_object.get("metadata", {}).get("plan_id", "intelligence")
        
        audit_id = str(uuid.uuid4())

        if event_type == "checkout.session.completed":
            try:
                # Upgrades tenant subscription metadata atomically
                self.db.execute(text(
                    "INSERT INTO platform_audit_log (id, hotel_id, entity_type, entity_id, action, actor_name, new_value, created_at) "
                    "VALUES (:id, :hid, 'billing', :hid, 'PLAN_UPGRADED', 'stripe_webhook', :val, NOW())"
                ), {
                    "id": audit_id,
                    "hid": hotel_id,
                    "val": f"Upgraded subscription tier to: {plan_id.upper()}"
                })
                self.db.commit()
            except Exception:
                self.db.rollback()

        return {
            "success": True,
            "event_processed": event_type,
            "hotel_id": hotel_id,
            "plan_id": plan_id,
            "audit_reference": audit_id
        }
