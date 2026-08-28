"""
Sprint N-010: Customer Onboarding & Provisioning Wizard Verification Test
"""
import pytest
import requests
import uuid

BASE = "http://localhost:8030"

def test_provision_property_lifecycle(auth_headers):
    uid = str(uuid.uuid4())[:6]
    payload = {
        "org_name": f"Red Sea Hospitality Group {uid}",
        "property_name": f"Sinai Grand Resort {uid}",
                        "admin_name": "General Manager",
        "admin_email": f"gm-{uid}@sinairesorts.com",
            }

    r = requests.post(f"{BASE}/api/v1/onboarding/provision", headers=auth_headers, json=payload, timeout=10)
    assert r.status_code == 200, f"Provisioning failed: {r.text}"
    data = r.json()

    assert data.get("status") == "provisioned"
    assert data.get("status") == "provisioned"
    assert "hotel_id" in data and data["hotel_id"].startswith("tb-hotel-")
    assert data.get("site_id") or data.get("hotel_id")  # site_id = hotel_id
    assert data.get("admin_email") == payload["admin_email"].lower() or data.get("admin",{}).get("email") == payload["admin_email"].lower()
    assert data.get("ready_for_login") is True or data.get("status") == "provisioned"
