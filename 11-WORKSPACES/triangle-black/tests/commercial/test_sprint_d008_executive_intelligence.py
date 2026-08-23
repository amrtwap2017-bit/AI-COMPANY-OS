"""Sprint D-008: Executive Intelligence Briefing — C-Suite Command Center"""
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

def test_executive_briefing():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/briefing", headers=h, timeout=15)
    assert r.status_code == 200, f"Briefing failed: {r.text}"
    data = r.json()
    assert data["briefing_type"] == "EXECUTIVE_INTELLIGENCE_BRIEFING"
    assert "financial_performance" in data
    assert "asset_portfolio_risk" in data
    assert "sla_governance" in data
    assert "supplier_intelligence" in data
    assert "recommended_executive_actions" in data
    assert "portfolio_health_index" in data
    phi = data["portfolio_health_index"]
    assert phi["index_score"] >= 0
    assert phi["grade"] in ["A+", "A", "B+", "B", "C", "D"]

def test_top_risks_endpoint():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/top-risks", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "risks" in data
    assert len(data["risks"]) >= 2
    risk = data["risks"][0]
    assert "rank" in risk
    assert "financial_impact_usd" in risk
    assert "days_to_action" in risk

def test_recommended_actions_endpoint():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/executive-intelligence/recommended-actions", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "actions" in data
    assert len(data["actions"]) >= 3
    action = data["actions"][0]
    assert action["priority"] == "URGENT"
    assert "roi_multiple" in action
    assert "avoided_risk_usd" in action
