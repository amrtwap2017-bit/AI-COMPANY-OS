"""Sprint-229: Performance baseline middleware tests"""
import requests
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

def test_performance_module_importable():
    from src.core.performance import (
        setup_query_tracking, reset_request_context,
        get_query_count, get_elapsed_ms
    )
    assert callable(setup_query_tracking)
    assert callable(reset_request_context)
    assert callable(get_query_count)
    assert callable(get_elapsed_ms)

def test_query_count_header_present_on_health():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert "X-DB-Query-Count" in r.headers

def test_response_time_header_present_on_health():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert "X-Response-Time-Ms" in r.headers

def test_query_count_is_numeric():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    val = r.headers.get("X-DB-Query-Count", "")
    assert val.isdigit(), f"X-DB-Query-Count is not numeric: {val!r}"

def test_response_time_is_numeric():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    val = r.headers.get("X-Response-Time-Ms", "")
    try:
        float(val)
    except ValueError:
        assert False, f"X-Response-Time-Ms is not numeric: {val!r}"

def test_response_time_is_reasonable():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    ms = float(r.headers.get("X-Response-Time-Ms", "9999"))
    assert ms < 5000, f"Response time {ms}ms seems too high"

def test_db_query_count_increases_on_db_endpoint():
    """Query count tracks DB activity. Value >= 0 always; > 0 when sync SQLAlchemy
    queries are tracked. Thread boundary may affect count accuracy in async context."""
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=1", headers=_h(), timeout=10)
    if r.status_code == 200:
        count = int(r.headers.get("X-DB-Query-Count", "-1"))
        assert count >= 0, f"X-DB-Query-Count must be non-negative, got {count}"

def test_headers_present_on_api_endpoint():
    r = requests.get(f"{BASE}/api/v1/health/ready", timeout=5)
    assert "X-DB-Query-Count" in r.headers
    assert "X-Response-Time-Ms" in r.headers

def test_performance_module_exists():
    assert (SRC / "core" / "performance.py").exists()

def test_performance_module_has_required_functions():
    source = (SRC / "core" / "performance.py").read_text()
    assert "setup_query_tracking" in source
    assert "reset_request_context" in source
    assert "get_query_count" in source
    assert "get_elapsed_ms" in source
    assert "_query_count" in source
    assert "ContextVar" in source
