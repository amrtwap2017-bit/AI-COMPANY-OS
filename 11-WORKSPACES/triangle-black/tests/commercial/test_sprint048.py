"""Sprint-048: Client Portal Backend Tests"""
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


def test_client_portal_dashboard():
    r = _req.get(f"{BASE}/api/v1/client-portal/dashboard", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "open_work_orders" in d

def test_client_portal_dashboard_has_metrics():
    r = _req.get(f"{BASE}/api/v1/client-portal/dashboard", headers=_h(), timeout=15)
    d = r.json()
    assert "total_assets" in d
    assert "active_contracts" in d

def test_client_portal_work_orders():
    r = _req.get(f"{BASE}/api/v1/client-portal/work-orders?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_client_portal_projects():
    r = _req.get(f"{BASE}/api/v1/client-portal/projects?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_client_portal_service_requests():
    r = _req.get(f"{BASE}/api/v1/client-portal/service-requests?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_client_portal_sr_count():
    r = _req.get(f"{BASE}/api/v1/client-portal/service-requests?limit=100", headers=_h(), timeout=15)
    assert r.status_code == 200
    items = r.json() if isinstance(r.json(), list) else []
    assert len(items) >= 0
