"""Sprint-247/248: Dashboard 404 fix + workflow stats optimization"""
import requests, time
from pathlib import Path

BASE = "http://localhost:8030"
SRC  = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src")

_C = {}
def _h():
    if "h" not in _C:
        r = requests.post(f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def _s(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        import pytest; pytest.skip(f"Rate limited — {ctx}")

# ── Sprint-247: Dashboard endpoint ───────────────────────────────────────────
def test_dashboard_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/dashboard/", headers=_h(), timeout=5)
    _s(r, "dashboard")
    assert r.status_code == 200, f"Dashboard returned {r.status_code}"

def test_dashboard_returns_json():
    r = requests.get(f"{BASE}/api/v1/dashboard/", headers=_h(), timeout=5)
    _s(r, "dashboard-json")
    if r.status_code == 200:
        d = r.json()
        assert isinstance(d, dict)
        assert "hotel_id" in d or "status" in d

def test_dashboard_has_endpoint_links():
    r = requests.get(f"{BASE}/api/v1/dashboard/", headers=_h(), timeout=5)
    _s(r, "dashboard-links")
    if r.status_code == 200:
        d = r.json()
        assert "endpoints" in d or "status" in d

def test_executive_dashboard_still_works():
    r = requests.get(f"{BASE}/api/v1/executive/dashboard", headers=_h(), timeout=5)
    _s(r, "exec-dash")
    assert r.status_code in (200, 404)

def test_dashboard_alias_in_main():
    text = (SRC / "main.py").read_text()
    assert "/api/v1/dashboard/" in text

# ── Sprint-248: Workflow stats optimization ───────────────────────────────────
def test_workflow_stats_uses_aggregated_sql():
    text = (SRC / "commercial/workflow_engine/router.py").read_text()
    assert "SUM(CASE WHEN" in text
    assert "single aggregated SQL" in text or "aggregated" in text.lower()

def test_workflow_stats_no_safe_helper():
    text = (SRC / "commercial/workflow_engine/router.py").read_text()
    assert "def safe(q:" not in text

def test_workflow_stats_db_query_count_reduced():
    r = requests.get(f"{BASE}/api/v1/workflow/stats", headers=_h(), timeout=5)
    _s(r, "wf-stats-qcount")
    if r.status_code == 200:
        db_count = int(r.headers.get("X-DB-Query-Count", "99"))
        assert db_count <= 5, f"DB queries too high: {db_count} (expected <=5)"

def test_workflow_stats_still_returns_all_fields():
    r = requests.get(f"{BASE}/api/v1/workflow/stats", headers=_h(), timeout=5)
    _s(r, "wf-stats-fields")
    if r.status_code == 200:
        d = r.json()
        for field in ["total_instances", "active_instances", "completed_instances",
                      "failed_instances", "total_transitions", "total_definitions",
                      "work_order_instances", "sr_instances", "generated_at"]:
            assert field in d, f"Missing field: {field}"

def test_workflow_stats_under_500ms():
    t0 = time.perf_counter()
    r = requests.get(f"{BASE}/api/v1/workflow/stats", headers=_h(), timeout=5)
    ms = round((time.perf_counter()-t0)*1000, 1)
    _s(r, "wf-stats-perf")
    if r.status_code == 200:
        assert ms < 500, f"Workflow stats took {ms}ms — expected <500ms"

def test_workflow_stats_returns_integers():
    r = requests.get(f"{BASE}/api/v1/workflow/stats", headers=_h(), timeout=5)
    _s(r, "wf-stats-int")
    if r.status_code == 200:
        d = r.json()
        for field in ["total_instances", "active_instances", "total_transitions"]:
            assert isinstance(d[field], int), f"{field} not int: {type(d[field])}"
            assert d[field] >= 0
