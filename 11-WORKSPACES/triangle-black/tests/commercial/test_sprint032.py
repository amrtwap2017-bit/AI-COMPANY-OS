"""Sprint-032: Maintenance Schedule Calendar Tests"""
import requests as _req, datetime

BASE = "http://localhost:8030"
_C = {}

def _h():
    if "h" not in _C:
        r = _req.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]


def test_maintenance_schedule_api():
    r = _req.get(f"{BASE}/api/v1/maintenance/schedule", headers=_h(), timeout=15)
    assert r.status_code == 200

def test_maintenance_schedule_has_data():
    r = _req.get(f"{BASE}/api/v1/maintenance/schedule", headers=_h(), timeout=15)
    d = r.json()
    assert "schedule" in d or "total" in d or isinstance(d, list)

def test_pm_plans_for_calendar():
    r = _req.get(f"{BASE}/api/v1/maintenance/pm-plans/", headers=_h(), timeout=15)
    assert r.status_code == 200
    items = r.json() if isinstance(r.json(), list) else r.json().get("plans", r.json().get("results", []))
    assert len(items) >= 40

def test_pm_plans_have_due_date():
    r = _req.get(f"{BASE}/api/v1/maintenance/pm-plans/", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("plans", [])
    if items:
        assert "next_due_ts" in items[0] or "next_due_date" in items[0]

def test_overdue_plans_exist():
    r = _req.get(f"{BASE}/api/v1/maintenance/pm-plans/", headers=_h(), timeout=15)
    items = r.json() if isinstance(r.json(), list) else r.json().get("plans", [])
    now = datetime.datetime.now(datetime.timezone.utc)
    overdue = [p for p in items if p.get("next_due_ts") and
               datetime.datetime.fromisoformat(p["next_due_ts"].replace("+00:00","").rstrip("Z")).replace(tzinfo=datetime.timezone.utc) < now]
    assert len(overdue) > 0, f"Expected overdue plans, found 0 of {len(items)}"

def test_maintenance_dashboard_has_pm_count():
    r = _req.get(f"{BASE}/api/v1/maintenance/dashboard", headers=_h(), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "active_pm_plans" in d or "open_work_orders" in d
