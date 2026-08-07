import pytest
"""Sprint-049: Alembic Migration + Platform State Tests"""
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


def test_engineering_inspections_api():
    r = _req.get(f"{BASE}/api/v1/inspections/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_engineering_site_visits_api():
    r = _req.get(f"{BASE}/api/v1/engineering/site-visits/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_client_portal_dashboard_api():
    r = _req.get(f"{BASE}/api/v1/client-portal/dashboard", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "open_work_orders" in d

def test_ai_signals_api():
    r = _req.get(f"{BASE}/api/v1/ai/signals/summary", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_balance_sheet_api():
    r = _req.get(f"{BASE}/api/v1/financial/gl/balance-sheet", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_vendor_scorecards_api():
    r = _req.get(f"{BASE}/api/v1/vendor-scorecards/?limit=5", headers=_h(), timeout=15)
    assert r.status_code == 200
