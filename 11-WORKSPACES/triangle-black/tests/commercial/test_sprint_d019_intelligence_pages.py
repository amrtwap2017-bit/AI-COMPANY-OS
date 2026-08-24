"""Sprint D-019: Intelligence Portal Pages — Energy, SLA, Financial, Asset Lifecycle"""
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

def test_energy_report_structure():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/energy-intelligence/report", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "energy_consumption" in d
    assert d["energy_consumption"]["trend"] in ["IMPROVING", "STABLE", "WORSENING"]
    assert "sustainability_roadmap" in d
    assert len(d["sustainability_roadmap"]["milestones"]) >= 4

def test_sla_report_structure():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/sla-intelligence/report", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["compliance_scorecard"]["overall_sla_compliance_pct"] >= 80.0
    assert len(d["technician_performance"]) >= 1
    assert len(d["governance_recommendations"]) >= 3

def test_financial_report_structure():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/financial-intelligence/report", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "spend_overview" in d
    assert "leakage_detection" in d
    assert len(d["leakage_detection"]["leakage_categories"]) >= 4
    assert len(d["cost_reduction_opportunities"]) >= 3

def test_asset_lifecycle_report_structure():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/asset-lifecycle/report", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "portfolio_summary" in d
    assert "pm_effectiveness" in d
    assert d["pm_effectiveness"]["pm_compliance_rate_pct"] >= 90.0
    assert len(d["lifecycle_risk_register"]) >= 3

def test_supplier_scorecards_structure():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/supplier-intelligence/scorecards", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "scorecards" in d
    assert len(d["scorecards"]) >= 1
    s = d["scorecards"][0]
    assert s["recommendation"] in ["PREFERRED", "APPROVED", "REVIEW"]
