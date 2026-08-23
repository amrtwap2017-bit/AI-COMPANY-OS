"""
Sprint C-008: Multi-Tenant SRE Pilot Control Room Verification Test
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

def test_unauthenticated_pilot_control_rejected():
    r = requests.get(f"{BASE}/api/v1/pilot-control/status", timeout=10)
    assert r.status_code in [401, 403]

def test_consolidated_pilot_status_api():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/pilot-control/status", headers=h, timeout=10)
    assert r.status_code == 200, f"Endpoint failed: {r.text}"
    data = r.json()

    assert "pilots" in data
    pilots = data["pilots"]
    assert len(pilots) >= 3  # Ensure Red Sea Grand, Sinai Pearl, and Gulf View are present

    names = [p["name"] for p in pilots]
    assert any("Red Sea" in n for n in names)
    assert any("Sinai" in n for n in names)
    assert any("Gulf" in n for n in names)

    # Verify structured schemas
    first_pilot = pilots[0]
    assert "health_index" in first_pilot
    assert "kpis" in first_pilot
    assert "total_assets" in first_pilot["kpis"]
    assert "procurement_spend_usd" in first_pilot["kpis"]
