"""Sprint D-006: Operational Intelligence Command Center — 5-Pillar Verification"""
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

def test_command_center_snapshot():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/operational-intelligence/command-center", headers=h, timeout=15)
    assert r.status_code == 200, f"Command center failed: {r.text}"
    data = r.json()
    assert data["snapshot_type"] == "OPERATIONAL_INTELLIGENCE_5_PILLARS"
    assert "pillar_1_asset_health" in data
    assert "pillar_2_work_execution" in data
    assert "pillar_3_procurement" in data
    assert "pillar_4_financial" in data
    assert "pillar_5_risk_signals" in data
    assert "overall_operational_health_score" in data
    score = data["overall_operational_health_score"]
    assert score["score"] >= 0
    assert score["grade"] in ["A", "B", "C", "D"]

def test_risk_signals_endpoint():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/operational-intelligence/risk-signals", headers=h, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "signals" in data
    assert isinstance(data["signals"], list)
    assert len(data["signals"]) >= 1
    s = data["signals"][0]
    assert "signal_id" in s
    assert "severity" in s
    assert "recommended_action" in s
