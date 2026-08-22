"""
Sprint N-013: Commercial Assessment Lead Intake Verification Test
"""
import pytest
import requests
import uuid

BASE = "http://localhost:8030"

def test_public_assessment_request_submission():
    uid = str(uuid.uuid4())[:6]
    payload = {
        "hotel_name": f"Sinai Pearl Resort {uid}",
        "contact_name": "Director of Engineering",
        "email": f"doe-{uid}@sinaipearl.com",
        "phone": "+20 100 123 4567",
        "rooms_count": 350,
        "property_type": "5-Star Luxury Resort"
    }

    r = requests.post(f"{BASE}/api/v1/commercial/assessment-request", json=payload, timeout=10)
    assert r.status_code == 200, f"Submission failed: {r.text}"
    data = r.json()

    assert data["success"] is True
    assert data["status"] == "received"
    assert "lead_id" in data
    assert "audit_reference" in data
