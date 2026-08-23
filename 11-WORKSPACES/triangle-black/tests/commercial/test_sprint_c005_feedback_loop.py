"""
Sprint C-005: Customer Feedback Loop & In-App Triage Verification Test
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

def test_feedback_submit_triage_lifecycle():
    h = _auth()

    # 1. Submit Critical Feedback
    payload = {
        "category": "performance",
        "severity": "critical",
        "message": "Chiller telemetry graphs lagging during shift handover",
        "user_email": "engineer@redseagrand.com"
    }
    r_sub = requests.post(f"{BASE}/api/v1/feedback/submit", json=payload, headers=h, timeout=10)
    assert r_sub.status_code == 200
    data_sub = r_sub.json()
    assert data_sub["success"] is True
    assert data_sub["priority"] == "P0"
    fb_id = data_sub["feedback_id"]

    # 2. List Feedback
    r_list = requests.get(f"{BASE}/api/v1/feedback/list", headers=h, timeout=10)
    assert r_list.status_code == 200
    items = r_list.json()
    assert any(item["id"] == fb_id for item in items)

    # 3. Triage Feedback
    patch_payload = {
        "priority": "P0",
        "status": "scheduled",
        "notes": "Assigned to SRE team for Redis pipeline indexing"
    }
    r_patch = requests.patch(f"{BASE}/api/v1/feedback/{fb_id}/triage", json=patch_payload, headers=h, timeout=10)
    assert r_patch.status_code == 200
    data_patch = r_patch.json()
    assert data_patch["success"] is True
    assert data_patch["status"] == "scheduled"
