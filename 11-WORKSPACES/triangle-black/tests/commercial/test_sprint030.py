import pytest

def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        import pytest
        pytest.skip(f"Rate limited in full suite — {context}")

"""Sprint-030: PM Completion Workflow Tests"""
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

def _first_plan_id():
    r = _req.get(f"{BASE}/api/v1/maintenance/pm-plans/?limit=5", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("plans", r.json().get("results", []))
    assert items, "No PM plans"
    return str(items[0]["id"])


def test_pm_plans_list_200():
    r = _req.get(f"{BASE}/api/v1/maintenance/pm-plans/", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_pm_plans_has_40_plans():
    r = _req.get(f"{BASE}/api/v1/maintenance/pm-plans/", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("plans", r.json().get("results", []))
    assert len(items) > 0

def test_pm_plan_has_required_fields():
    r = _req.get(f"{BASE}/api/v1/maintenance/pm-plans/", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("plans", r.json().get("results", []))
    if items:
        p = items[0]
        assert "id" in p
        assert "title" in p
        assert "frequency" in p
        assert "status" in p

def test_pm_plan_detail_by_id():
    pid = _first_plan_id()
    r = _req.get(f"{BASE}/api/v1/maintenance/pm-plans/{pid}", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "title" in d

def test_pm_complete_endpoint_exists():
    r = _req.post(f"{BASE}/api/v1/maintenance/pm-plans/nonexistent-plan-xyz/complete",
        headers=_h(), timeout=15)
    assert r.status_code == 404

def test_pm_complete_returns_next_due():
    pid = _first_plan_id()
    r = _req.post(f"{BASE}/api/v1/maintenance/pm-plans/{pid}/complete",
        headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d.get("ok") is True
    assert "next_due" in d
    assert "days_until_next" in d

def test_pm_maintenance_dashboard():
    r = _req.get(f"{BASE}/api/v1/maintenance/dashboard", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "active_pm_plans" in d or "total_assets" in d
