"""Sprint D-016: Master Intelligence Aggregator — 8-Pillar Unified Snapshot"""
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

def test_master_intelligence_snapshot():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/intelligence/snapshot", headers=h, timeout=20)
    assert r.status_code == 200, f"Snapshot failed: {r.text}"
    data = r.json()
    assert data["snapshot_type"] == "MASTER_INTELLIGENCE_SNAPSHOT"
    assert data["version"] == "v6.0"
    # Verify all 8 pillars present
    assert "pillar_1_operations" in data
    assert "pillar_2_financial" in data
    assert "pillar_3_assets" in data
    assert "pillar_4_sla" in data
    assert "pillar_5_suppliers" in data
    assert "pillar_6_risk" in data
    assert "pillar_7_ai_recommendations" in data
    assert "pillar_8_portfolio_health" in data
    assert "intelligence_summary" in data
    # Verify intelligence summary
    summary = data["intelligence_summary"]
    assert "overall_platform_verdict" in summary
    assert "operational_health_grade" in summary
    assert "active_risk_count" in summary
    assert summary["active_risk_count"] >= 0
    assert len(data["pillar_7_ai_recommendations"]) >= 3
