"""Sprint D-012: Energy & Sustainability Intelligence"""
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

def test_energy_intelligence_report():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/energy-intelligence/report", headers=h, timeout=15)
    assert r.status_code == 200, f"Report failed: {r.text}"
    data = r.json()
    assert data["report_type"] == "ENERGY_SUSTAINABILITY_INTELLIGENCE"
    assert "energy_consumption" in data
    assert "carbon_footprint" in data
    assert "efficiency_benchmarks" in data
    assert "cost_optimization" in data
    assert "sustainability_roadmap" in data
    assert "energy_risk_alerts" in data
    ec = data["energy_consumption"]
    assert ec["trend"] in ["IMPROVING", "STABLE", "WORSENING"]

def test_carbon_footprint():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/energy-intelligence/carbon-footprint", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "total_co2_tonnes_ytd" in data
    assert "scope_1_emissions_tonnes" in data
    assert "scope_2_emissions_tonnes" in data
    assert "net_zero_target_year" in data
    assert data["net_zero_target_year"] >= 2025

def test_cost_optimization():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/energy-intelligence/cost-optimization", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "opportunities" in data
    assert len(data["opportunities"]) >= 3
    opp = data["opportunities"][0]
    assert "annual_savings_usd" in opp
    assert "roi_multiple" in opp
    assert "payback_months" in opp
    total_savings = sum(o["annual_savings_usd"] for o in data["opportunities"])
    assert total_savings > 50000

def test_energy_risk_alerts():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/energy-intelligence/alerts", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "alerts" in data
    assert len(data["alerts"]) >= 2
    alert = data["alerts"][0]
    assert "severity" in alert
    assert "financial_impact_usd" in alert
    assert "urgency_days" in alert
    assert alert["severity"] in ["HIGH", "MEDIUM", "LOW"]
