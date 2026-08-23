"""
Customer Feedback Service — Triangle Black Commercial v5.4
Manages in-app customer feedback collection, priority triage (P0-P4), and audit tracking.
"""
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

class FeedbackService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def submit_feedback(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        feedback_id = f"fb-{uuid.uuid4().hex[:10]}"
        audit_id = str(uuid.uuid4())
        
        category = payload.get("category", "ux")
        severity = payload.get("severity", "medium")
        message = payload.get("message", "").strip()
        user_email = payload.get("user_email", "user@hotel.com").strip()

        # Initial automated priority assignment
        if severity == "critical":
            priority = "P0"
        elif severity == "high":
            priority = "P1"
        else:
            priority = "P2"

        try:
            # 1. Insert Feedback
            self.db.execute(text(
                "INSERT INTO customer_feedback (id, hotel_id, user_email, category, severity, priority, message, status, created_at, updated_at) "
                "VALUES (:id, :hid, :email, :cat, :sev, :pri, :msg, 'open', NOW(), NOW())"
            ), {
                "id": feedback_id,
                "hid": self.hotel_id,
                "email": user_email,
                "cat": category,
                "sev": severity,
                "pri": priority,
                "msg": message
            })

            # 2. Log Audit Event
            self.db.execute(text(
                "INSERT INTO platform_audit_log (id, hotel_id, entity_type, entity_id, action, actor_name, new_value, created_at) "
                "VALUES (:id, :hid, 'feedback', :fbid, 'FEEDBACK_SUBMITTED', :actor, :val, NOW())"
            ), {
                "id": audit_id,
                "hid": self.hotel_id,
                "fbid": feedback_id,
                "actor": user_email,
                "val": f"Submitted [{priority}] {category.upper()} feedback: {message[:60]}"
            })

            self.db.commit()

            return {
                "success": True,
                "feedback_id": feedback_id,
                "priority": priority,
                "status": "open",
                "message": "Feedback submitted and queued for triage",
                "audit_reference": audit_id
            }

        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "error": str(e)
            }

    def list_feedback(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        query_str = "SELECT id, user_email, category, severity, priority, message, status, triage_notes, created_at FROM customer_feedback WHERE hotel_id = :h"
        params = {"h": self.hotel_id}

        if status:
            query_str += " AND status = :s"
            params["s"] = status

        query_str += " ORDER BY created_at DESC LIMIT 50"

        rows = self.db.execute(text(query_str), params).mappings().all()
        return [dict(r) for r in rows]

    def triage_feedback(self, feedback_id: str, priority: str, status: str, notes: Optional[str] = None) -> Dict[str, Any]:
        audit_id = str(uuid.uuid4())
        try:
            self.db.execute(text(
                "UPDATE customer_feedback SET priority = :pri, status = :st, triage_notes = :notes, updated_at = NOW() "
                "WHERE id = :id AND hotel_id = :hid"
            ), {
                "id": feedback_id,
                "hid": self.hotel_id,
                "pri": priority,
                "st": status,
                "notes": notes or ""
            })

            self.db.execute(text(
                "INSERT INTO platform_audit_log (id, hotel_id, entity_type, entity_id, action, actor_name, new_value, created_at) "
                "VALUES (:id, :hid, 'feedback', :fbid, 'FEEDBACK_TRIAGED', 'product_manager', :val, NOW())"
            ), {
                "id": audit_id,
                "hid": self.hotel_id,
                "fbid": feedback_id,
                "val": f"Triaged feedback {feedback_id} to priority {priority}, status {status}"
            })

            self.db.commit()
            return {
                "success": True,
                "feedback_id": feedback_id,
                "priority": priority,
                "status": status,
                "audit_reference": audit_id
            }

        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "error": str(e)
            }
