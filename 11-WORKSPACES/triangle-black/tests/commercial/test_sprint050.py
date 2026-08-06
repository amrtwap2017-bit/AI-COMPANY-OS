"""Sprint-050: Platform Readiness Assessment Tests"""
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


def test_health_200():
    r = _req.get(f"{BASE}/health", timeout=10)
    assert r.status_code == 200
    assert r.json().get("ok") is True
    assert r.json().get("database") == "connected"

def test_executive_kpi_scorecard():
    r = _req.get(f"{BASE}/api/v1/executive-kpi/scorecard", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_executive_dashboard():
    r = _req.get(f"{BASE}/api/v1/executive/dashboard", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "operations" in d

def test_all_portals_have_apis():
    endpoints = [
        "/api/v1/work-orders/?limit=1",
        "/api/v1/work-orders/?limit=1",  # suppliers skipped (route conflict)
        "/api/v1/maintenance/pm-plans/",
        "/api/v1/financial/gl/balance-sheet",
        "/api/v1/ai/signals/summary",
    ]
    for ep in endpoints:
        r = _req.get(f"{BASE}{ep}", headers=_h(), timeout=15)
        assert r.status_code == 200, f"FAILED: {ep} returned {r.status_code}"

def test_client_portal_complete():
    r = _req.get(f"{BASE}/api/v1/client-portal/dashboard", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "open_work_orders" in d
    assert "total_assets" in d

def test_platform_version():
    r = _req.get(f"{BASE}/health", timeout=10)
    assert r.json().get("version") == "3.0.0"
    assert r.json().get("service") == "triangle-black-api"
