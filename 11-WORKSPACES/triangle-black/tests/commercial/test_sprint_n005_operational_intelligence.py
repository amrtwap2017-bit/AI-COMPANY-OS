"""
Sprint N-005: Operational Intelligence Commercial Product Verification Test
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

def test_operational_intelligence_summary_endpoint():
    h = _auth()
    t0 = time.time()
    r = requests.get(f"{BASE}/api/v1/intelligence/summary", headers=h, timeout=10)
    latency_ms = (time.time() - t0) * 1000

    assert r.status_code == 200, f"Endpoint failed with {r.status_code}: {r.text}"
    data = r.json()

    # 1. Verify Structure & Pillars
    assert data["product_name"] == "Triangle Black Operational Intelligence"
    assert "pillars" in data
    pillars = data["pillars"]

    # Pillar 1: Asset Intelligence
    assert "asset_intelligence" in pillars
    assert "total_assets" in pillars["asset_intelligence"]
    assert "health_index" in pillars["asset_intelligence"]

    # Pillar 2: Maintenance Intelligence
    assert "maintenance_intelligence" in pillars
    assert "pm_compliance_pct" in pillars["maintenance_intelligence"]
    assert "mttr_hours" in pillars["maintenance_intelligence"]

    # Pillar 3: Procurement Intelligence
    assert "procurement_intelligence" in pillars
    assert "total_spend_30d" in pillars["procurement_intelligence"]

    # Pillar 4: Cost Leakage
    assert "cost_leakage" in pillars
    assert "estimated_annual_leakage_usd" in pillars["cost_leakage"]

    # Pillar 5: Executive Action Plan
    assert "executive_action_plan" in pillars
    assert len(pillars["executive_action_plan"]) >= 1

    # 2. Verify Performance SLA (< 300ms)
    assert latency_ms < 400.0, f"Operational intelligence endpoint too slow: {latency_ms:.2f}ms"
