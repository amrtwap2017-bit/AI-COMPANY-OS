import pytest

def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        import pytest
        pytest.skip(f"Rate limited in full suite — {context}")

"""Sprint-039: Platform Metrics Dashboard Tests"""
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


def test_executive_kpi_summary():
    r = _req.get(f"{BASE}/api/v1/executive-kpi/summary", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "revenue_egp" in d or "period" in d

def test_executive_kpi_scorecard():
    r = _req.get(f"{BASE}/api/v1/executive-kpi/scorecard", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "scorecard" in d

def test_maintenance_dashboard():
    r = _req.get(f"{BASE}/api/v1/maintenance/dashboard", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "total_assets" in d

def test_maintenance_dashboard_wo_count():
    r = _req.get(f"{BASE}/api/v1/maintenance/dashboard", headers=_h(), timeout=15)
    d = r.json()
    assert "open_work_orders" in d
    assert isinstance(d["open_work_orders"], (int, float))

def test_executive_kpi_trends():
    r = _req.get(f"{BASE}/api/v1/executive-kpi/trends/operations", headers=_h(), timeout=15)
    assert r.status_code in (200, 404, 422)

def test_health_endpoint():
    r = _req.get(f"{BASE}/health", timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert d.get("ok") is True
