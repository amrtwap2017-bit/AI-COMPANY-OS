"""T-015: Platform Operations Status endpoint"""
import requests
import pytest
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
        pytest.skip(f"Rate limited — {ctx}")

def test_platform_status_file_exists():
    assert (SRC / "commercial/platform_status/router.py").exists()

def test_platform_status_has_required_endpoints():
    src = (SRC / "commercial/platform_status/router.py").read_text()
    for ep in ["/status", "/events", "/events/stats"]:
        assert ep in src, f"Missing endpoint: {ep}"

def test_platform_status_has_all_subsystems():
    src = (SRC / "commercial/platform_status/router.py").read_text()
    for sub in ["_db_health", "_events_stats", "_workflow_stats",
                "_sla_stats", "_twin_stats", "_operations_stats"]:
        assert sub in src, f"Missing subsystem: {sub}"

def test_platform_status_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/platform/status",
                     headers=_h(), timeout=10)
    _s(r, "platform-status")
    assert r.status_code == 200

def test_platform_status_has_all_sections():
    r = requests.get(f"{BASE}/api/v1/platform/status",
                     headers=_h(), timeout=10)
    _s(r, "platform-sections")
    if r.status_code == 200:
        data = r.json()
        assert "hotel_id" in data
        assert "subsystems" in data
        for key in ["database", "events", "workflow", "sla",
                    "digital_twin", "operations"]:
            assert key in data["subsystems"], f"Missing subsystem: {key}"

def test_platform_status_database_healthy():
    r = requests.get(f"{BASE}/api/v1/platform/status",
                     headers=_h(), timeout=10)
    _s(r, "db-health")
    if r.status_code == 200:
        db = r.json()["subsystems"]["database"]
        assert db.get("connected") is True
        assert db.get("status") == "healthy"

def test_platform_events_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/platform/events",
                     headers=_h(), timeout=10)
    _s(r, "platform-events")
    assert r.status_code == 200

def test_platform_events_has_results():
    r = requests.get(f"{BASE}/api/v1/platform/events",
                     headers=_h(), timeout=10)
    _s(r, "platform-events-results")
    if r.status_code == 200:
        data = r.json()
        assert "count" in data
        assert "results" in data
        assert isinstance(data["results"], list)

def test_platform_events_stats_endpoint():
    r = requests.get(f"{BASE}/api/v1/platform/events/stats",
                     headers=_h(), timeout=10)
    _s(r, "events-stats")
    assert r.status_code == 200

def test_platform_events_filter_by_status():
    r = requests.get(f"{BASE}/api/v1/platform/events?status=pending",
                     headers=_h(), timeout=10)
    _s(r, "events-filter")
    assert r.status_code == 200

def test_platform_status_sla_has_compliance():
    r = requests.get(f"{BASE}/api/v1/platform/status",
                     headers=_h(), timeout=10)
    _s(r, "sla-compliance")
    if r.status_code == 200:
        sla = r.json()["subsystems"]["sla"]
        assert "compliance_pct" in sla
        assert isinstance(sla["compliance_pct"], (int, float))

def test_health_still_ok():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert r.status_code == 200
