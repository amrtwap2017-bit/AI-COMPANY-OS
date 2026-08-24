"""Sprint D-009: Customer Demo Environment — Walkthrough + Live KPIs + ROI"""
import requests

BASE = "http://localhost:8030"
_C = {}

def _auth():
    if "h" not in _C:
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        assert r.status_code == 200
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_demo_walkthrough():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/demo/walkthrough", headers=h, timeout=15)
    assert r.status_code == 200, f"Demo walkthrough failed: {r.text}"
    data = r.json()
    assert data["demo_version"] == "v6.0"
    assert "Red Sea Grand" in data["property"]
    assert len(data["demo_stages"]) == 6
    assert "live_kpis" in data
    assert "roi_summary" in data
    kpis = data["live_kpis"]
    assert kpis["sla_compliance_pct"] >= 90.0
    roi = data["roi_summary"]
    assert roi["total_quantified_value_usd"] > 100000

def test_demo_roi_summary():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/demo/roi-summary", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "roi_multiple" in data
    assert "payback_period_months" in data
    assert data["annual_platform_cost_usd"] > 0
    assert data["total_quantified_value_usd"] > data["annual_platform_cost_usd"]
