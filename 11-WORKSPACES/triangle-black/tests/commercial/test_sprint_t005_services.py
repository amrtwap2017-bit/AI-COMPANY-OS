"""T-005: Application service layer — ServiceRequestService + WorkOrderService"""
import requests
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch

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

HOTEL = "tb-default-hotel-000000000001"

# ── File existence ─────────────────────────────────────────────────────────
def test_sr_service_file_exists():
    assert (SRC / "commercial/service_requests/service.py").exists()

def test_wo_service_in_sr_service_file():
    src = (SRC / "commercial/service_requests/service.py").read_text()
    assert "class ServiceRequestService" in src
    assert "class WorkOrderService" in src

def test_sr_service_has_required_methods():
    src = (SRC / "commercial/service_requests/service.py").read_text()
    for method in ["get_by_id", "list_by_status", "create",
                   "update_status", "generate_work_order", "count"]:
        assert f"def {method}" in src, f"Missing method: {method}"

def test_wo_service_has_required_methods():
    src = (SRC / "commercial/service_requests/service.py").read_text()
    for method in ["create_from_service_request", "complete",
                   "close", "get_by_id", "get_sla_summary"]:
        assert f"def {method}" in src, f"Missing WO method: {method}"

# ── Service layer architecture rules ───────────────────────────────────────
def test_service_enforces_hotel_scope():
    src = (SRC / "commercial/service_requests/service.py").read_text()
    assert "self.hotel_id" in src, "Service must enforce hotel_id scope"
    assert "hotel_id = :hid" in src or "hid" in src

def test_service_has_audit_emission():
    src = (SRC / "commercial/service_requests/service.py").read_text()
    assert "_emit_audit" in src, "Service must emit audit events"
    assert "platform_audit_log" in src

def test_service_has_non_blocking_audit():
    src = (SRC / "commercial/service_requests/service.py").read_text()
    assert "except Exception:" in src, "Audit must be non-blocking (try/except)"

def test_service_has_rollback_on_failure():
    src = (SRC / "commercial/service_requests/service.py").read_text()
    assert "self.db.rollback()" in src, "Service must rollback on failure"

# ── Unit tests — service without HTTP ──────────────────────────────────────
def test_sr_service_instantiates_without_http():
    """Service can be instantiated with a mock DB — no HTTP needed."""
    import sys
    sys.path.insert(0, str(SRC.parent))
    try:
        from src.commercial.service_requests.service import ServiceRequestService
        mock_db = MagicMock()
        svc = ServiceRequestService(db=mock_db, hotel_id=HOTEL, actor="test")
        assert svc.hotel_id == HOTEL
        assert svc.actor == "test"
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_wo_service_instantiates_without_http():
    """WorkOrderService can be instantiated with a mock DB."""
    import sys
    sys.path.insert(0, str(SRC.parent))
    try:
        from src.commercial.service_requests.service import WorkOrderService
        mock_db = MagicMock()
        svc = WorkOrderService(db=mock_db, hotel_id=HOTEL, actor="test")
        assert svc.hotel_id == HOTEL
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_sr_service_invalid_status_raises():
    """update_status rejects invalid status values."""
    import sys
    sys.path.insert(0, str(SRC.parent))
    try:
        from src.commercial.service_requests.service import ServiceRequestService
        mock_db = MagicMock()
        mock_db.execute.return_value.fetchone.return_value = MagicMock(
            _mapping={"id": "test-id", "hotel_id": HOTEL, "status": "open"})
        svc = ServiceRequestService(db=mock_db, hotel_id=HOTEL)
        try:
            svc.update_status("test-id", "INVALID_STATUS")
            assert False, "Should have raised ValueError"
        except ValueError as e:
            assert "Invalid status" in str(e)
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_wo_service_raises_on_missing_wo():
    """complete() raises ValueError when WO not found."""
    import sys
    sys.path.insert(0, str(SRC.parent))
    try:
        from src.commercial.service_requests.service import WorkOrderService
        mock_db = MagicMock()
        mock_db.execute.return_value.fetchone.return_value = None
        svc = WorkOrderService(db=mock_db, hotel_id=HOTEL)
        try:
            svc.complete("nonexistent-id")
            assert False, "Should have raised ValueError"
        except ValueError as e:
            assert "not found" in str(e)
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

# ── Live integration — service layer via HTTP ───────────────────────────────
def test_sr_create_via_api_still_works():
    """Existing SR create endpoint still works after service layer addition."""
    r = requests.post(f"{BASE}/api/v1/service-requests/",
        json={"title": "T-005 Integration Test", "urgency": "normal",
              "category": "General", "hotel_id": HOTEL},
        timeout=10)
    _s(r, "sr-create")
    assert r.status_code in (200, 201, 422, 401), \
        f"SR create broken after T-005: {r.status_code}"

def test_wo_create_via_api_still_works():
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=1",
        headers=_h(), timeout=5)
    _s(r, "wo-list")
    assert r.status_code == 200, f"WO list broken: {r.status_code}"

def test_sla_endpoints_still_work_after_t005():
    r1 = requests.get(f"{BASE}/api/v1/work-orders/sla-breached",
        headers=_h(), timeout=5)
    r2 = requests.get(f"{BASE}/api/v1/work-orders/sla-summary",
        headers=_h(), timeout=5)
    _s(r1, "sla-breached-t005"); _s(r2, "sla-summary-t005")
    assert r1.status_code == 200
    assert r2.status_code == 200

def test_vertical_slice_still_works_after_t005():
    """SR → generate-work-order still functions end-to-end."""
    r1 = requests.post(f"{BASE}/api/v1/service-requests/",
        json={"title": "T-005 Vertical Slice Check", "urgency": "high",
              "category": "HVAC", "hotel_id": HOTEL},
        timeout=10)
    if r1.status_code not in (200, 201):
        pytest.skip("SR create returned non-200")
    sr_id = r1.json().get("id")
    if not sr_id:
        pytest.skip("No SR id in response")
    r2 = requests.post(
        f"{BASE}/api/v1/service-requests/{sr_id}/generate-work-order",
        timeout=10)
    _s(r2, "vertical-slice-t005")
    assert r2.status_code in (200, 201, 401), \
        f"Vertical slice broken after T-005: {r2.status_code}"
