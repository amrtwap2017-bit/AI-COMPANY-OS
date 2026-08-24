"""Sprint D-023: Value Certification Portal + Demo Environment Portal"""
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

def test_value_certification_complete():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/commercial-value/certification", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["certification_status"] == "COMMERCIALLY_VERIFIED"
    assert "financial_roi" in d
    assert "operational_achievements" in d
    assert "governance_signoff" in d
    roi = d["financial_roi"]
    assert roi["total_quantified_savings_usd"] > 40000
    assert "roi_multiple" in roi

def test_demo_walkthrough_complete():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/demo/walkthrough", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["demo_version"] == "v6.0"
    assert "Red Sea Grand" in d["property"]
    assert len(d["demo_stages"]) == 6
    stage = d["demo_stages"][0]
    assert "title" in stage
    assert "narrative" in stage
    assert "system_action" in stage
    assert "api_endpoint" in stage

def test_demo_roi_summary_complete():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/demo/roi-summary", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["roi_multiple"] == "7.1x"
    assert d["payback_period_months"] < 3.0
    assert d["certification_status"] == "COMMERCIALLY_VERIFIED"
    assert d["total_quantified_value_usd"] > d["annual_platform_cost_usd"]

def test_demo_live_kpis():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/demo/live-kpis", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["sla_compliance_pct"] >= 90.0
    assert d["pm_compliance_pct"] >= 90.0
    assert d["mttr_hours"] < 5.0
