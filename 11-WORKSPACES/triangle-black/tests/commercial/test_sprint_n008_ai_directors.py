"""
Sprint N-008: AI Advisory Directors Verification Test Suite
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

@pytest.mark.parametrize("director", ["maintenance", "procurement", "operations", "executive"])
def test_ai_advisory_directors_api(director):
    h = _auth()
    payload = {
        "director": director,
        "context": {
            "failures_90d": 3,
            "vibration_spike": True,
            "total_spend_30d": 50000.0,
            "emergency_pos": 4,
            "open_backlog": 6
        }
    }
    r = requests.post(f"{BASE}/api/v1/ai-directors/analyze", json=payload, headers=h, timeout=10)
    assert r.status_code == 200, f"Director {director} failed: {r.text}"
    data = r.json()

    assert "director" in data
    assert "risk_level" in data
    assert "evidence" in data and len(data["evidence"]) >= 1
    assert "recommendation" in data
    assert "audit_id" in data
    assert data["governance_status"] == "governed_advisory"
