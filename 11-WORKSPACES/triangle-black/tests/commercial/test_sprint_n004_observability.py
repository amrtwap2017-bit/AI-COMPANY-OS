"""
Sprint N-004: Observability & Telemetry Platform Test Suite
"""
import pytest
import requests

BASE = "http://localhost:8030"

_C = {}
def _auth():
    if "h" not in _C:
        r = requests.post(
            f"{BASE}/api/v1/auth/login",
            data={"username": "amr@triangleblack.com", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        assert r.status_code == 200
        _C["h"] = {"Authorization": f"Bearer {r.json()['access_token']}"}
    return _C["h"]

def test_telemetry_store_unit():
    from src.core.observability import telemetry_store

    telemetry_store.record_request(200, 24.5, db_queries=1)
    telemetry_store.record_request(200, 18.2, db_queries=1)
    telemetry_store.record_cache(hit=True)
    telemetry_store.record_ai_request(140.0)

    report = telemetry_store.get_telemetry_report()
    assert "traffic" in report
    assert "performance" in report
    assert "cache" in report
    assert "ai_telemetry" in report
    assert report["traffic"]["total_requests"] >= 2
    assert report["cache"]["hits"] >= 1

def test_platform_telemetry_api_endpoint():
    h = _auth()
    r = requests.get(f"{BASE}/api/v1/platform/telemetry", headers=h, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "operational"
    assert "performance" in data
    assert "traffic" in data
    assert "uptime_seconds" in data
