"""Sprint D-010: Supplier Intelligence & Procurement Analytics"""
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

def test_procurement_intelligence_report():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/supplier-intelligence/report", headers=h, timeout=15)
    assert r.status_code == 200, f"Report failed: {r.text}"
    data = r.json()
    assert data["report_type"] == "PROCUREMENT_INTELLIGENCE_REPORT"
    assert "vendor_network" in data
    assert "spend_analysis" in data
    assert "vendor_scorecards" in data
    assert "procurement_risk" in data
    assert "savings_opportunities" in data

def test_vendor_scorecards():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/supplier-intelligence/scorecards", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "scorecards" in data
    assert len(data["scorecards"]) >= 1
    sc = data["scorecards"][0]
    assert "company_name" in sc
    assert "performance_rating" in sc
    assert "recommendation" in sc
    assert sc["recommendation"] in ["PREFERRED", "APPROVED", "REVIEW"]

def test_savings_opportunities():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/supplier-intelligence/savings-opportunities", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "opportunities" in data
    assert len(data["opportunities"]) >= 3
    opp = data["opportunities"][0]
    assert "estimated_savings_usd" in opp
    assert "roi_multiple" in opp
    assert opp["estimated_savings_usd"] > 0

def test_procurement_risk():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/supplier-intelligence/risk", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "overall_procurement_risk" in data
    assert data["overall_procurement_risk"] in ["LOW", "MEDIUM", "HIGH"]
    assert "risks" in data
    assert len(data["risks"]) >= 2
