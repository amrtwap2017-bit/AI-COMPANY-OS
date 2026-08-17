"""Sprint-243: Performance profiling — response time baselines + slow endpoint detection"""
import requests
import time
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

def _timed(method, url, **kwargs):
    start = time.perf_counter()
    r = requests.request(method, url, **kwargs)
    ms = round((time.perf_counter() - start) * 1000, 1)
    return r, ms

# ── Health endpoint performance ───────────────────────────────────────────────
def test_health_live_under_500ms():
    _, ms = _timed("GET", f"{BASE}/api/v1/health/live", timeout=5)
    assert ms < 500, f"Health live took {ms}ms — expected <500ms"

def test_health_ready_under_1000ms():
    _, ms = _timed("GET", f"{BASE}/api/v1/health/ready", timeout=5)
    assert ms < 1000, f"Health ready took {ms}ms — expected <1000ms"

# ── Response time headers present ────────────────────────────────────────────
def test_response_time_header_is_numeric():
    r, _ = _timed("GET", f"{BASE}/api/v1/health/live", timeout=5)
    val = r.headers.get("X-Response-Time-Ms", "")
    assert val != "", "X-Response-Time-Ms header missing"
    try:
        float(val)
    except ValueError:
        assert False, f"X-Response-Time-Ms not numeric: {val}"

def test_db_query_count_header_present():
    r, _ = _timed("GET", f"{BASE}/api/v1/health/live", timeout=5)
    assert "X-DB-Query-Count" in r.headers

# ── Core endpoint performance baselines ──────────────────────────────────────
def test_work_orders_list_under_3000ms():
    r, ms = _timed("GET", f"{BASE}/api/v1/work-orders/?limit=10",
        headers=_h(), timeout=10)
    _s(r, "wo-perf")
    if r.status_code == 200:
        assert ms < 3000, f"WO list took {ms}ms — expected <3000ms"

def test_assets_list_under_3000ms():
    r, ms = _timed("GET", f"{BASE}/api/v1/assets/?limit=10", timeout=10)
    _s(r, "assets-perf")
    if r.status_code == 200:
        assert ms < 3000, f"Assets list took {ms}ms — expected <3000ms"

def test_leads_list_under_3000ms():
    r, ms = _timed("GET", f"{BASE}/api/v1/leads/?limit=10",
        headers=_h(), timeout=10)
    _s(r, "leads-perf")
    if r.status_code == 200:
        assert ms < 3000, f"Leads list took {ms}ms — expected <3000ms"

def test_workflow_stats_under_2000ms():
    r, ms = _timed("GET", f"{BASE}/api/v1/workflow/stats",
        headers=_h(), timeout=10)
    _s(r, "wf-stats-perf")
    if r.status_code == 200:
        assert ms < 2000, f"Workflow stats took {ms}ms — expected <2000ms"

def test_contracts_list_under_3000ms():
    r, ms = _timed("GET", f"{BASE}/api/v1/contracts/?limit=10",
        headers=_h(), timeout=10)
    _s(r, "contracts-perf")
    if r.status_code == 200:
        assert ms < 3000, f"Contracts list took {ms}ms — expected <3000ms"

# ── Performance module integrity ──────────────────────────────────────────────
def test_performance_module_complete():
    src = (SRC / "core/performance.py").read_text()
    required = ["ContextVar", "threading", "perf_counter",
                "get_query_count", "get_elapsed_ms", "reset_request_context"]
    for fn in required:
        assert fn in src, f"Missing: {fn}"

def test_performance_middleware_in_main():
    src = (SRC / "main.py").read_text()
    assert "performance_tracking_middleware" in src
    assert "X-DB-Query-Count" in src
    assert "X-Response-Time-Ms" in src

# ── Login endpoint performance ────────────────────────────────────────────────
def test_login_under_3000ms():
    _, ms = _timed("POST", f"{BASE}/api/v1/auth/login",
        data={"username": "amr@triangleblack.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=10)
    assert ms < 3000, f"Login took {ms}ms — expected <3000ms"

# ── Workflow endpoints performance ────────────────────────────────────────────
def test_workflow_instances_under_2000ms():
    r, ms = _timed("GET", f"{BASE}/api/v1/workflow/instances",
        headers=_h(), timeout=10)
    _s(r, "wf-instances-perf")
    if r.status_code == 200:
        assert ms < 2000, f"Workflow instances took {ms}ms"

def test_workflow_definitions_under_2000ms():
    r, ms = _timed("GET", f"{BASE}/api/v1/workflow/definitions",
        headers=_h(), timeout=10)
    _s(r, "wf-defs-perf")
    if r.status_code == 200:
        assert ms < 2000, f"Workflow definitions took {ms}ms"
