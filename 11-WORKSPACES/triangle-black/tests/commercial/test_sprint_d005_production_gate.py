"""
Sprint D-005: Enterprise Production Gate Verification
10-gate readiness check + 3-pilot operational summary
"""
import requests

BASE = "http://localhost:8030"

_C = {}
def _auth():
    if "h" not in _C:
        r = requests.post(
            f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        assert r.status_code == 200
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]


def test_production_readiness_gate():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/production-gate/readiness", headers=h, timeout=15)
    assert r.status_code == 200, f"Gate failed: {r.text}"
    data = r.json()

    assert "overall_status" in data
    assert "gate_score_pct" in data
    assert "checks" in data
    assert len(data["checks"]) == 10
    assert data["gate_score_pct"] >= 70.0
    assert data["failed"] == 0
    assert data["overall_status"] in ["PRODUCTION_READY", "CONDITIONAL"]


def test_pilot_operational_summary():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/production-gate/pilot-summary", headers=h, timeout=15)
    assert r.status_code == 200, f"Pilot summary failed: {r.text}"
    data = r.json()

    assert "pilots" in data
    pilots = data["pilots"]
    assert len(pilots) >= 3

    names = [p["name"] for p in pilots]
    assert any("Red Sea" in n for n in names)
    assert any("Sinai" in n for n in names)
    assert any("Gulf" in n for n in names)

    for pilot in pilots:
        assert "kpis" in pilot
        assert pilot["kpis"]["assets"] >= 20
        assert pilot["kpis"]["suppliers"] >= 3
        assert pilot["operational"] is True
