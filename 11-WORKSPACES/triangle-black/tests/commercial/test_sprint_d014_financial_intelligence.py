"""Sprint D-014: Financial Leakage Detection & Cost Intelligence"""
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

def test_financial_intelligence_report():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/financial-intelligence/report", headers=h, timeout=15)
    assert r.status_code == 200, f"Report failed: {r.text}"
    data = r.json()
    assert data["report_type"] == "FINANCIAL_LEAKAGE_COST_INTELLIGENCE"
    assert "spend_overview" in data
    assert "leakage_detection" in data
    assert "budget_variance" in data
    assert "procurement_efficiency" in data
    assert "financial_risk_register" in data
    assert "cost_reduction_opportunities" in data

def test_leakage_detection():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/financial-intelligence/leakage", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "total_identified_leakage_usd" in data
    assert "leakage_categories" in data
    assert len(data["leakage_categories"]) >= 4
    cat = data["leakage_categories"][0]
    assert "category" in cat
    assert "amount_usd" in cat
    assert "remediation" in cat
    assert "prevention_potential_usd" in data

def test_cost_reduction_opportunities():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/financial-intelligence/cost-reduction", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "opportunities" in data
    assert len(data["opportunities"]) >= 3
    opp = data["opportunities"][0]
    assert "annual_savings_usd" in opp
    assert "roi_multiple" in opp
    assert "confidence_pct" in opp
    total_savings = sum(o["annual_savings_usd"] for o in data["opportunities"])
    assert total_savings >= 0

def test_financial_risk_register():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/financial-intelligence/risk-register", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "risks" in data
    assert len(data["risks"]) >= 3
    risk = data["risks"][0]
    assert "financial_exposure_usd" in risk
    assert "mitigation" in risk
    assert "deadline_days" in risk
    assert risk["probability"] in ["HIGH", "MEDIUM", "LOW"]
