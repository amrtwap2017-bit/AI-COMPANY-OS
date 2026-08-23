"""
Sprint C-004: Golden Vertical Slice 3.0 Verification Test
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

def test_execute_live_operational_flow():
    h = _auth()
    r = requests.post(f"{BASE}/api/v1/showcase/execute-flow", headers=h, timeout=10)
    assert r.status_code == 200, f"Flow execution failed: {r.text}"
    data = r.json()

    assert data["success"] is True
    assert data["flow_status"] == "COMPLETED_AND_VERIFIED"
    assert "service_request_id" in data
    assert "work_order_id" in data
    assert "invoice_id" in data
    assert data["financial_settlement_usd"] == 1850.00
    assert data["audit_trail_events"] == 3
    assert "ai_telemetry" in data

def test_golden_trace_retrieves_live_flow():
    h = _auth()
    # 1. Execute flow
    r_flow = requests.post(f"{BASE}/api/v1/showcase/execute-flow", headers=h, timeout=10)
    assert r_flow.status_code == 200
    wo_id = r_flow.json()["work_order_id"]

    # 2. Retrieve trace for the generated work order
    r_trace = requests.get(f"{BASE}/api/v1/showcase/trace/{wo_id}", headers=h, timeout=10)
    assert r_trace.status_code == 200
    trace_data = r_trace.json()
    assert trace_data["work_order_id"] == wo_id
    assert "stages" in trace_data
    assert trace_data["stages"]["stage_2_work_order"]["status"] == "CLOSED"
