"""Sprint-046: Engineering Field Reports Tests"""
import requests as _req

BASE = "http://localhost:8030"
_C = {}

def _h():
    if "h" not in _C:
        r = _req.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]


def test_site_visits_200():
    r = _req.get(f"{BASE}/api/v1/engineering/site-visits/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_quality_records_200():
    r = _req.get(f"{BASE}/api/v1/engineering/quality-records/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_safety_records_200():
    r = _req.get(f"{BASE}/api/v1/engineering/safety-records/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_punch_list_200():
    r = _req.get(f"{BASE}/api/v1/engineering/punch-list/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_maintenance_downtime_api():
    r = _req.get(f"{BASE}/api/v1/maintenance/downtime", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_maintenance_costs_api():
    r = _req.get(f"{BASE}/api/v1/maintenance/costs", headers=_h(), timeout=15)
    assert r.status_code == 200
