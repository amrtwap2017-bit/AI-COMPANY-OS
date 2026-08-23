"""
Sprint D-002: Stripe Billing & Subscription Verification Test Suite
"""
import pytest
import requests

BASE = "http://localhost:8030"

_C = {}
def _auth():
    if "h" not in _C:
        r = requests.post(
            f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        assert r.status_code == 200
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_stripe_checkout_session_api():
    h = _auth()
    payload = {"plan_id": "intelligence"}
    r = requests.post(f"{BASE}/api/v1/billing/checkout-session", json=payload, headers=h, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is True
    assert "checkout_url" in data
    assert data["plan_id"] == "intelligence"

def test_stripe_webhook_upgrade():
    h = _auth()
    payload = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "metadata": {
                    "hotel_id": "tb-default-hotel-000000000001",
                    "plan_id": "enterprise"
                }
            }
        }
    }
    r = requests.post(f"{BASE}/api/v1/billing/webhook", json=payload, headers=h, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is True
    assert data["plan_id"] == "enterprise"
    assert "audit_reference" in data
