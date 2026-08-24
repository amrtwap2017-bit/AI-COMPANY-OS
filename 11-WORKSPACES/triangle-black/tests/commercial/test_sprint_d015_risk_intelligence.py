"""Sprint D-015: Unified Operational Risk Intelligence Engine"""
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

def test_unified_risk_report():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/risk-intelligence/report", headers=h, timeout=15)
    assert r.status_code == 200, f"Report failed: {r.text}"
    data = r.json()
    assert data["report_type"] == "UNIFIED_OPERATIONAL_RISK_INTELLIGENCE"
    assert "composite_risk_score" in data
    assert "total_active_risks" in data
    assert "top_5_priority_actions" in data
    assert "domain_risk_scores" in data
    assert data["total_active_risks"] >= 1
    crs = data["composite_risk_score"]
    assert "score" in crs
    assert "grade" in crs
    assert "status" in crs
    assert 0 <= crs["score"] <= 100

def test_composite_risk_score():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/risk-intelligence/composite-score", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "score" in data
    assert "grade" in data
    assert data["grade"] in ["A+", "A", "B+", "B", "C+", "C", "D"]
    assert "total_financial_exposure_usd" in data
    assert data["total_financial_exposure_usd"] >= 0

def test_priority_actions():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/risk-intelligence/priority-actions", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "actions" in data
    assert len(data["actions"]) >= 1
    action = data["actions"][0]
    assert "rank" in action
    assert action["rank"] == 1
    assert "domain" in action
    assert "financial_exposure_usd" in action
    assert "deadline_days" in action

def test_domain_risk_scores():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/risk-intelligence/domain-scores", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    required_domains = ["asset_lifecycle", "sla_compliance", "supplier_network",
                        "financial_control", "energy_efficiency", "regulatory_compliance"]
    for domain in required_domains:
        assert domain in data, f"Missing domain: {domain}"
        assert "score" in data[domain]
        assert "grade" in data[domain]
        assert 0 <= data[domain]["score"] <= 100
