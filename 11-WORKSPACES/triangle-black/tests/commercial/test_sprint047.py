"""Sprint-047: Maintenance Reports Tests"""
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


def test_maintenance_downtime_200():
    r = _req.get(f"{BASE}/api/v1/maintenance/downtime", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_maintenance_costs_200():
    r = _req.get(f"{BASE}/api/v1/maintenance/costs", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_maintenance_work_items_200():
    r = _req.get(f"{BASE}/api/v1/maintenance/work-items", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_maintenance_dashboard_200():
    r = _req.get(f"{BASE}/api/v1/maintenance/dashboard", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "total_assets" in d

def test_maintenance_intelligence_200():
    r = _req.get(f"{BASE}/api/v1/maintenance/intelligence", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_maintenance_pm_plans_200():
    r = _req.get(f"{BASE}/api/v1/maintenance/pm-plans/", headers=_h(), timeout=15)
    assert r.status_code == 200
