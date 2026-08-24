"""Sprint D-013: SLA Compliance & Governance Intelligence"""
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

def test_sla_governance_report():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/sla-intelligence/report", headers=h, timeout=15)
    assert r.status_code == 200, f"Report failed: {r.text}"
    data = r.json()
    assert data["report_type"] == "SLA_COMPLIANCE_GOVERNANCE"
    assert "compliance_scorecard" in data
    assert "work_order_sla_analysis" in data
    assert "priority_breakdown" in data
    assert "escalation_intelligence" in data
    assert "technician_performance" in data
    assert "governance_recommendations" in data

def test_compliance_scorecard():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/sla-intelligence/scorecard", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "overall_sla_compliance_pct" in data
    assert "compliance_grade" in data
    assert data["compliance_grade"] in ["A+", "A", "B+", "B", "C", "D"]
    assert data["overall_sla_compliance_pct"] >= 80.0
    assert "sla_breach_rate_pct" in data

def test_technician_performance():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/sla-intelligence/technician-performance", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "technicians" in data
    assert len(data["technicians"]) >= 1
    t = data["technicians"][0]
    assert "technician_name" in t
    assert "sla_compliance_pct" in t
    assert "rating" in t
    assert t["rating"] in ["EXCELLENT", "GOOD", "SATISFACTORY", "NEEDS_IMPROVEMENT"]

def test_governance_recommendations():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/sla-intelligence/governance-recommendations", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) >= 3
    rec = data["recommendations"][0]
    assert "priority" in rec
    assert "expected_improvement" in rec
    assert "timeline_days" in rec
    assert rec["priority"] in ["HIGH", "MEDIUM", "LOW"]
