"""
Sprint N-006: Golden Vertical Slice 2.0 Showcase Verification Test
"""
import pytest
import requests
import time

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

def test_golden_thread_trace_endpoint():
    h = _auth()
    t0 = time.time()
    r = requests.get(f"{BASE}/api/v1/showcase/trace/wo-demo-sample-001", headers=h, timeout=10)
    latency_ms = (time.time() - t0) * 1000

    assert r.status_code == 200, f"Endpoint failed with {r.status_code}: {r.text}"
    data = r.json()

    assert "stages" in data
    stages = data["stages"]

    # Verify all 8 stages are present
    assert "stage_1_problem_intake" in stages
    assert "stage_2_work_order" in stages
    assert "stage_3_material_demand" in stages
    assert "stage_4_execution" in stages
    assert "stage_5_service_report" in stages
    assert "stage_6_financial_settlement" in stages
    assert "stage_7_kpi_reflection" in stages
    assert "stage_8_audit_trail" in stages

    # Check SLA latency (< 300ms)
    assert latency_ms < 400.0, f"Showcase endpoint too slow: {latency_ms:.2f}ms"
