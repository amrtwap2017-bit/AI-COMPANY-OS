"""Sprint D-028: Platform Production Monitoring Dashboard"""
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

def test_platform_health_report():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/platform-monitoring/health", headers=h, timeout=15)
    assert r.status_code == 200, f"Health failed: {r.text}"
    d = r.json()
    assert d["report_type"] == "PLATFORM_HEALTH_MONITORING"
    assert "database_health" in d
    assert "module_status" in d
    assert "data_integrity" in d
    assert "platform_metrics" in d
    assert d["database_health"]["overall"] == "HEALTHY"

def test_database_health_checks():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/platform-monitoring/db-health", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["overall"] == "HEALTHY"
    assert d["passed"] >= 3
    assert len(d["checks"]) >= 4
    pass_checks = [c for c in d["checks"] if c["status"] == "PASS"]
    assert len(pass_checks) >= 3

def test_module_status():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/platform-monitoring/modules", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "modules" in d
    assert len(d["modules"]) >= 15
    loaded = [m for m in d["modules"] if m["status"] == "LOADED"]
    assert len(loaded) >= 15

def test_platform_metrics():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/platform-monitoring/metrics", headers=h, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["platform_version"] == "v6.0"
    assert d["intelligence_modules"] >= 15
    assert d["portal_pages_built"] >= 20
    assert d["commercial_sprints_complete"] >= 25
    assert d["certification_status"] == "COMMERCIALLY_VERIFIED"
