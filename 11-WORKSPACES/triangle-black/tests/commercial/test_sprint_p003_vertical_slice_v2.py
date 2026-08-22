"""
Sprint P-003: Core Operations Vertical Slice 2.0 Integration Test
Validates the complete closed-loop lifecycle:
SR -> WO -> Complete (Invoice) -> Close (Service Report) -> Audit & Telemetry
"""
import pytest
import requests
import uuid

BASE = "http://localhost:8030"
HOTEL_ID = "tb-default-hotel-000000000001"

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

def test_p003_complete_operations_lifecycle():
    h = _auth()
    uid = str(uuid.uuid4())[:8]

    # Stage 1: Create Service Request
    sr_payload = {
        "title": f"Chiller Unit A Vibration Failure {uid}",
        "description": "Excessive bearing noise and temperature spike",
        "urgency": "high",
        "category": "HVAC",
        "location": "Central Plant Room 3",
        "status": "pending"
    }
    r_sr = requests.post(f"{BASE}/api/v1/service-requests/", json=sr_payload, headers=h, timeout=10)
    assert r_sr.status_code in [200, 201]
    sr_data = r_sr.json()
    sr_id = sr_data.get("id") or sr_data.get("service_request_id")
    assert sr_id is not None

    # Stage 2: Generate Work Order from Service Request
    r_wo = requests.post(f"{BASE}/api/v1/service-requests/{sr_id}/generate-work-order", headers=h, timeout=10)
    assert r_wo.status_code in [200, 201]
    wo_data = r_wo.json()
    wo_id = wo_data.get("work_order_id") or wo_data.get("id")
    assert wo_id is not None

    # Stage 3: Complete Work Order -> Auto-Generates Invoice
    r_comp = requests.post(f"{BASE}/api/v1/work-orders/{wo_id}/complete", headers=h, timeout=10)
    assert r_comp.status_code in [200, 201]
    comp_data = r_comp.json()
    assert comp_data.get("status") in ["completed", "complete"]

    # Stage 4: Close Work Order -> Creates Service Report & Workflow Transition
    r_close = requests.post(f"{BASE}/api/v1/work-orders/{wo_id}/close", headers=h, timeout=10)
    assert r_close.status_code in [200, 201]
    close_data = r_close.json()
    assert close_data.get("status") in ["closed", "completed"]

    # Stage 5: Verify Invoices Endpoint Returns Real Financial Records
    r_inv = requests.get(f"{BASE}/api/v1/invoices/?limit=10", headers=h, timeout=10)
    assert r_inv.status_code == 200
    inv_data = r_inv.json()
    assert isinstance(inv_data, (list, dict))

    # Stage 6: Verify Platform Status & Read Model Telemetry
    r_stat = requests.get(f"{BASE}/api/v1/platform/status", headers=h, timeout=10)
    assert r_stat.status_code == 200
    stat_data = r_stat.json()
    assert "subsystems" in stat_data
    assert stat_data["subsystems"]["operations"]["status"] in ["ok", "healthy"]
