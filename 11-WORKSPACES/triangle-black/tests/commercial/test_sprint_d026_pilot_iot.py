"""Sprint D-026: Pilot Control Room + IoT Telemetry Gateway"""
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

def test_pilot_control_status():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/pilot-control/status", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "pilots" in d
    pilots = d["pilots"]
    assert len(pilots) >= 3
    for p in pilots:
        assert "health_index" in p
        assert "kpis" in p
        assert p["kpis"]["total_assets"] >= 20

def test_production_gate_readiness():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/production-gate/readiness", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["gate_version"] == "D-005"
    assert d["failed"] == 0
    assert d["gate_score_pct"] >= 70.0
    assert len(d["checks"]) == 10

def test_iot_telemetry_normal():
    h = _auth()
    r = requests.post(f"{BASE}/api/v1/integrations/ingest/iot",
        json={"asset_id": "ast-pump-01", "vibration_rms": 1.2, "temperature_c": 45.0, "runtime_hours": 1200.0},
        headers=h, timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert d["success"] is True
    assert d["anomaly_detected"] is False
    assert d["action_queued"] == "NONE"

def test_iot_telemetry_anomaly():
    h = _auth()
    r = requests.post(f"{BASE}/api/v1/integrations/ingest/iot",
        json={"asset_id": "ast-chiller-01", "vibration_rms": 6.2, "temperature_c": 78.0, "runtime_hours": 3500.0},
        headers=h, timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert d["success"] is True
    assert d["anomaly_detected"] is True
    assert d["action_queued"] == "DISPATCH_AI_DIRECTOR"

def test_pilot_operational_summary():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/production-gate/pilot-summary", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "pilots" in d
    assert len(d["pilots"]) >= 3
    for p in d["pilots"]:
        assert p["operational"] is True
        assert p["kpis"]["assets"] >= 20
        assert p["kpis"]["suppliers"] >= 3
