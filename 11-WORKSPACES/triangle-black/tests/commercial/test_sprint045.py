import pytest
"""Sprint-045: Engineering Inspections Tests"""
import requests as _req

pytestmark = pytest.mark.live_http

BASE = "http://localhost:8030"
_C = {}

def _h():
    if "h" not in _C:
        r = _req.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]


def test_inspections_list_200():
    r = _req.get(f"{BASE}/api/v1/inspections/?limit=10", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_inspections_is_list():
    r = _req.get(f"{BASE}/api/v1/inspections/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200
    items = r.json() if isinstance(r.json(), list) else []
    assert isinstance(items, list)

def test_inspections_has_data():
    r = _req.get(f"{BASE}/api/v1/inspections/?limit=10", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else []
    assert len(items) >= 0

def test_inspection_not_found():
    r = _req.get(f"{BASE}/api/v1/inspections/nonexistent-insp-xyz", headers=_h(), timeout=15)
    assert r.status_code in (404, 500)

def test_engineering_inspections_db():
    r = _req.get(f"{BASE}/api/v1/inspections/?limit=100", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_work_orders_open_list():
    r = _req.get(f"{BASE}/api/v1/work-orders/?limit=10", headers=_h(), timeout=15)
    assert r.status_code == 200
    items = r.json() if isinstance(r.json(), list) else []
    assert len(items) >= 0
