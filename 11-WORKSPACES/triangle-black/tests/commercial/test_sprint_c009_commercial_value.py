"""
Sprint C-009: Commercial Value Certification & ROI Engine Verification Test
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

def test_value_certification_report_endpoint():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/commercial-value/certification", headers=h, timeout=10)
    assert r.status_code == 200, f"Endpoint failed: {r.text}"
    data = r.json()

    assert data["certification_status"] == "COMMERCIALLY_VERIFIED"
    assert "financial_roi" in data
    assert "operational_achievements" in data
    assert data["financial_roi"]["total_quantified_savings_usd"] > 40000.0
    assert data["operational_achievements"]["critical_chiller_downtime_hours"] == 0.0
