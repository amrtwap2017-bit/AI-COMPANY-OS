"""
Commercial Assessment Lead Intake Router — Triangle Black Commercial v5.2
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db

router = APIRouter(prefix="/commercial", tags=["Commercial Inquiries"])

@router.post("/assessment-request")
def submit_assessment_request(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    """Public intake endpoint for hospitality operational assessments."""
    hotel_name = payload.get("hotel_name", "").strip()
    contact_name = payload.get("contact_name", "Director of Engineering").strip()
    email = payload.get("email", "").lower().strip()
    phone = payload.get("phone", "")
    rooms_count = int(payload.get("rooms_count", 250))
    property_type = payload.get("property_type", "Resort Hotel")

    if not hotel_name or not email:
        raise HTTPException(status_code=400, detail="hotel_name and email are required")

    lead_id = f"lead-com-{uuid.uuid4().hex[:8]}"
    audit_id = str(uuid.uuid4())
    default_hotel = "tb-default-hotel-000000000001"

    try:
        # 1. Create Lead Record
        db.execute(text(
            "INSERT INTO leads (id, hotel_id, name, email, company, status, priority, source, score, created_at, updated_at) "
            "VALUES (:id, :hid, :name, :email, :comp, 'new', 'high', 'website_assessment', 0, NOW(), NOW())"
        ), {
            "id": lead_id,
            "hid": default_hotel,
            "name": contact_name,
            "email": email,
            "comp": hotel_name
        })

        # 2. Log Audit Event
        db.execute(text(
            "INSERT INTO platform_audit_log (id, hotel_id, entity_type, entity_id, action, actor, details, created_at) "
            "VALUES (:id, :hid, 'lead', :lid, 'ASSESSMENT_REQUESTED', :actor, :details, NOW())"
        ), {
            "id": audit_id,
            "hid": default_hotel,
            "lid": lead_id,
            "actor": email,
            "details": f"Operational assessment requested for {hotel_name} ({rooms_count} rooms, {property_type})"
        })

        db.commit()

        return {
            "success": True,
            "lead_id": lead_id,
            "hotel_name": hotel_name,
            "status": "received",
            "message": "Assessment request successfully received. An engineer will reach out within 24 hours.",
            "audit_reference": audit_id
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error during lead intake: {str(e)}")
