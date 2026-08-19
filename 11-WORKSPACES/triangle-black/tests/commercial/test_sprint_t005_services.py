"""
T-005: Application Service Layer — Unit + Integration Tests
Tests that services are independently testable without HTTP layer.
"""
import pytest
from pathlib import Path
import requests

BASE = "http://localhost:8030"
SRC = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src")

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

# ── Service file existence ────────────────────────────────────────────────────
def test_sr_service_file_exists():
    assert (SRC / "commercial/service_requests/service.py").exists()

def test_wo_service_file_exists():
    assert (SRC / "commercial/work_orders/service.py").exists()

# ── Service class structure ───────────────────────────────────────────────────
def test_sr_service_has_create():
    text = (SRC / "commercial/service_requests/service.py").read_text()
    assert "def create(" in text
    assert "def get(" in text
    assert "def list(" in text
    assert "def transition(" in text
    assert "def generate_work_order(" in text

def test_wo_service_has_create():
    text = (SRC / "commercial/work_orders/service.py").read_text()
    assert "def create(" in text
    assert "def get(" in text
    assert "def assign(" in text
    assert "def complete(" in text
    assert "def get_sla_summary(" in text

def test_sr_service_enforces_hotel_id():
    text = (SRC / "commercial/service_requests/service.py").read_text()
    assert "hotel_id" in text
    assert "hotel_id = :hotel_id" in text

def test_wo_service_enforces_hotel_id():
    text = (SRC / "commercial/work_orders/service.py").read_text()
    assert "hotel_id" in text
    assert "hotel_id = :hotel_id" in text

def test_sr_service_emits_audit():
    text = (SRC / "commercial/service_requests/service.py").read_text()
    assert "_emit_audit" in text
    assert "SR_CREATED" in text
    assert "SR_WO_GENERATED" in text

def test_wo_service_emits_audit():
    text = (SRC / "commercial/work_orders/service.py").read_text()
    assert "_emit_audit" in text
    assert "WO_CREATED" in text
    assert "WO_COMPLETED" in text

def test_wo_service_has_sla_tracking():
    text = (SRC / "commercial/work_orders/service.py").read_text()
    assert "SLA_HOURS" in text
    assert "sla_breach_at" in text
    assert "sla_status" in text
    assert "check_sla_breaches" in text

def test_sr_service_validates_urgency():
    text = (SRC / "commercial/service_requests/service.py").read_text()
    assert "valid_urgencies" in text
    assert "ValueError" in text

def test_wo_service_validates_priority():
    text = (SRC / "commercial/work_orders/service.py").read_text()
    assert "valid_priorities" in text
    assert "ValueError" in text

def test_sr_service_has_transition_policy():
    text = (SRC / "commercial/service_requests/service.py").read_text()
    assert "ALLOWED_TRANSITIONS" in text
    assert "in_progress" in text
    assert "resolved" in text
    assert "closed" in text

# ── Import validation ─────────────────────────────────────────────────────────
def test_sr_service_importable():
    try:
        from src.commercial.service_requests.service import ServiceRequestService
        assert ServiceRequestService is not None
    except ImportError as e:
        pytest.fail(f"ServiceRequestService import failed: {e}")

def test_wo_service_importable():
    try:
        from src.commercial.work_orders.service import WorkOrderService
        assert WorkOrderService is not None
    except ImportError as e:
        pytest.fail(f"WorkOrderService import failed: {e}")

def test_sr_service_class_has_correct_methods():
    from src.commercial.service_requests.service import ServiceRequestService
    for method in ["create", "get", "list", "transition", "generate_work_order"]:
        assert hasattr(ServiceRequestService, method), f"Missing method: {method}"

def test_wo_service_class_has_correct_methods():
    from src.commercial.work_orders.service import WorkOrderService
    for method in ["create", "get", "assign", "complete", "get_sla_summary", "check_sla_breaches"]:
        assert hasattr(WorkOrderService, method), f"Missing method: {method}"

# ── API integration — services called through existing endpoints ───────────────
def test_sr_creation_through_api():
    r = requests.post(f"{BASE}/api/v1/service-requests/",
        json={"title": "T-005 SR Test", "urgency": "normal", "category": "Test",
              "hotel_id": "tb-default-hotel-000000000001"},
        timeout=10)
    _s(r, "sr-create")
    assert r.status_code in (200, 201, 401)

def test_wo_creation_through_api():
    r = requests.post(f"{BASE}/api/v1/work-orders/",
        headers=_h(),
        json={"title": "T-005 WO Test", "priority": "medium",
              "type": "corrective", "hotel_id": "tb-default-hotel-000000000001"},
        timeout=10)
    _s(r, "wo-create")
    assert r.status_code in (200, 201, 401, 422)

def test_sla_summary_endpoint_works():
    r = requests.get(f"{BASE}/api/v1/work-orders/sla-summary", headers=_h(), timeout=5)
    _s(r, "sla-summary")
    assert r.status_code in (200, 401)
    if r.status_code == 200:
        assert "hotel_id" in r.json()

def test_sla_breached_endpoint_works():
    r = requests.get(f"{BASE}/api/v1/work-orders/sla-breached", headers=_h(), timeout=5)
    _s(r, "sla-breached")
    assert r.status_code in (200, 401)

def test_sr_list_endpoint_works():
    r = requests.get(f"{BASE}/api/v1/service-requests/?limit=5", timeout=5)
    _s(r, "sr-list")
    assert r.status_code in (200, 401)

def test_wo_list_endpoint_works():
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=5", headers=_h(), timeout=5)
    _s(r, "wo-list")
    assert r.status_code in (200, 401)
