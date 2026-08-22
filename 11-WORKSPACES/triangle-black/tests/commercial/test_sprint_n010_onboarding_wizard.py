"""
Sprint N-010: Customer Onboarding & Provisioning Wizard Verification Test
"""
import pytest
import requests
import uuid

BASE = "http://localhost:8030"

def test_provision_property_lifecycle():
    uid = str(uuid.uuid4())[:6]
    payload = {
        "company_name": f"Red Sea Hospitality Group {uid}",
        "hotel_name": f"Sinai Grand Resort {uid}",
        "brand": "Premier Resorts",
        "site_name": "Main Coastal Complex",
        "admin_name": "General Manager",
        "admin_email": f"gm-{uid}@sinairesorts.com",
        "admin_password": "SecurePassword2026!"
    }

    r = requests.post(f"{BASE}/api/v1/onboarding/provision-property", json=payload, timeout=10)
    assert r.status_code == 200, f"Provisioning failed: {r.text}"
    data = r.json()

    assert data["success"] is True
    assert data["status"] == "provisioned"
    assert "hotel_id" in data and data["hotel_id"].startswith("tb-hotel-")
    assert "site_id" in data
    assert data["admin_email"] == payload["admin_email"].lower()
    assert data["ready_for_login"] is True
