"""
Sprint N-007: Executive Control Center Verification Test
"""
import pytest
import requests
import time

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

def test_unified_executive_summary_endpoint():
    h = _auth()
    t0 = time.time()
    r = requests.get(f"{BASE}/api/v1/executive/summary", headers=h, timeout=10)
    latency_ms = (time.time() - t0) * 1000

    assert r.status_code == 200, f"Endpoint failed: {r.text}"
    data = r.json()

    assert "financial_kpis" in data
    assert "sla_kpis" in data
    assert "risk_kpis" in data
    assert "supplier_kpis" in data

    assert data["financial_kpis"]["budget_total_usd"] == 120000.0
    assert data["sla_kpis"]["sla_compliance_pct"] >= 90.0

    assert latency_ms < 800.0, f"Executive summary endpoint too slow: {latency_ms:.2f}ms"
