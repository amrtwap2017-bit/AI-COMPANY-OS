"""Sprint D-011: Asset Lifecycle Intelligence & Maintenance Cost Analytics"""
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

def test_lifecycle_intelligence_report():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/asset-lifecycle/report", headers=h, timeout=15)
    assert r.status_code == 200, f"Report failed: {r.text}"
    data = r.json()
    assert data["report_type"] == "ASSET_LIFECYCLE_INTELLIGENCE"
    assert "portfolio_summary" in data
    assert "criticality_breakdown" in data
    assert "maintenance_cost_analysis" in data
    assert "replacement_economics" in data
    assert "lifecycle_risk_register" in data
    assert "pm_effectiveness" in data
    ps = data["portfolio_summary"]
    assert "total_assets" in ps
    assert "portfolio_health_score" in ps

def test_replacement_economics():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/asset-lifecycle/replacement-economics", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "economics" in data
    assert len(data["economics"]) >= 1
    e = data["economics"][0]
    assert "replacement_cost_usd" in e
    assert "recommendation" in e
    assert e["recommendation"] in ["MONITOR", "PLAN_REPLACEMENT"]

def test_pm_effectiveness():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/asset-lifecycle/pm-effectiveness", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "pm_compliance_rate_pct" in data
    assert "effectiveness_grade" in data
    assert data["pm_compliance_rate_pct"] >= 90.0
    assert data["effectiveness_grade"] in ["A", "B", "C", "D"]

def test_lifecycle_risk_register():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/asset-lifecycle/risk-register", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "risks" in data
    assert len(data["risks"]) >= 3
    risk = data["risks"][0]
    assert "financial_exposure_usd" in risk
    assert "recommended_action" in risk
    assert "timeline_months" in risk
