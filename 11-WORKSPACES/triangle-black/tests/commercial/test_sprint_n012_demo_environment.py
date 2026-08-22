"""
Sprint N-012: Demo Environment & Commercial Scenarios Verification Test
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

def test_list_demo_scenarios():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/demo/scenarios", headers=h, timeout=10)
    assert r.status_code == 200
    scenarios = r.json()
    assert len(scenarios) == 5
    ids = [s["id"] for s in scenarios]
    assert "chiller_vibration" in ids
    assert "emergency_po_leakage" in ids

def test_trigger_demo_scenario():
    h = _auth()
    payload = {"scenario_id": "chiller_vibration"}
    r = requests.post(f"{BASE}/api/v1/demo/trigger-scenario", json=payload, headers=h, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is True
    assert "audit_reference" in data
    assert "Chiller" in data["title"]
