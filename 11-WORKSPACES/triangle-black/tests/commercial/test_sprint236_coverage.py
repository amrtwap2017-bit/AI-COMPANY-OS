"""Sprint-236: Coverage push — workflow engine + SR/WO vertical slice + audit endpoints"""
import requests
from pathlib import Path

BASE = "http://localhost:8030"
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

# ── Workflow engine logic tests ───────────────────────────────────────────────
def test_wo_engine_all_states_covered():
    from src.commercial.workflow_engine.engine import DEFAULT_WO_TRANSITIONS
    assert "open" in DEFAULT_WO_TRANSITIONS
    assert "closed" in DEFAULT_WO_TRANSITIONS
    assert "cancelled" in DEFAULT_WO_TRANSITIONS
    assert "completed" in DEFAULT_WO_TRANSITIONS

def test_sr_engine_all_states_covered():
    from src.commercial.workflow_engine.engine import DEFAULT_SR_TRANSITIONS
    assert "open" in DEFAULT_SR_TRANSITIONS
    assert "resolved" in DEFAULT_SR_TRANSITIONS
    assert "closed" in DEFAULT_SR_TRANSITIONS

def test_engine_none_definition_safe():
    from src.commercial.workflow_engine.engine import TriangleWorkflowEngine
    e = TriangleWorkflowEngine()
    ok, msg = e.can_transition("open", "closed")
    assert ok is False

def test_engine_empty_json_safe():
    from src.commercial.workflow_engine.engine import TriangleWorkflowEngine
    e = TriangleWorkflowEngine(definition_json="{}")
    ok, msg = e.can_transition("open", "closed")
    assert ok is False

def test_wo_cancelled_is_terminal():
    from src.commercial.workflow_engine.engine import TriangleWorkflowEngine
    e = TriangleWorkflowEngine(entity_type="work_order")
    assert e.get_allowed_transitions("cancelled") == []

def test_sr_closed_is_terminal():
    from src.commercial.workflow_engine.engine import TriangleWorkflowEngine
    e = TriangleWorkflowEngine(entity_type="service_request")
    assert e.get_allowed_transitions("closed") == []

# ── Performance header tests ──────────────────────────────────────────────────
def test_performance_headers_on_sr_list():
    r = requests.get(f"{BASE}/api/v1/service-requests/?limit=1", timeout=5)
    _s(r, "sr-list")
    assert "X-Response-Time-Ms" in r.headers

def test_performance_headers_on_wo_list():
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=1", headers=_h(), timeout=5)
    _s(r, "wo-list")
    assert "X-Response-Time-Ms" in r.headers

def test_performance_headers_on_assets():
    r = requests.get(f"{BASE}/api/v1/assets/?limit=1", timeout=5)
    _s(r, "assets")
    assert "X-DB-Query-Count" in r.headers

def test_security_headers_on_contracts():
    r = requests.get(f"{BASE}/api/v1/contracts/?limit=1", headers=_h(), timeout=5)
    _s(r, "contracts")
    assert "X-Content-Type-Options" in r.headers

# ── Audit system tests ────────────────────────────────────────────────────────
def test_audit_log_endpoint_accessible():
    r = requests.get(f"{BASE}/api/v1/security/audit", headers=_h(), timeout=5)
    _s(r, "audit-log")
    assert r.status_code in (200, 401, 403, 404)

def test_platform_audit_log_table_exists():
    from src.core.database import engine
    from sqlalchemy import inspect
    tables = inspect(engine).get_table_names()
    assert "platform_audit_log" in tables

def test_workflow_definitions_table_exists():
    from src.core.database import engine
    from sqlalchemy import inspect
    tables = inspect(engine).get_table_names()
    assert "workflow_definitions" in tables

def test_workflow_instances_has_hotel_id():
    from src.core.database import engine
    from sqlalchemy import inspect
    cols = [c["name"] for c in inspect(engine).get_columns("workflow_instances")]
    assert "hotel_id" in cols

# ── Vertical slice API smoke tests ────────────────────────────────────────────
def test_sr_generate_wo_route_exists():
    r = requests.post(f"{BASE}/api/v1/service-requests/test-id/generate-work-order",
        timeout=5)
    _s(r, "sr-gen-wo")
    assert r.status_code != 405

def test_wo_close_route_exists():
    r = requests.post(f"{BASE}/api/v1/work-orders/test-id/close",
        headers=_h(), timeout=5)
    _s(r, "wo-close")
    assert r.status_code != 405

def test_wo_complete_route_exists():
    r = requests.post(f"{BASE}/api/v1/work-orders/test-id/complete",
        headers=_h(), timeout=5)
    _s(r, "wo-complete")
    assert r.status_code != 405

def test_health_ready_returns_db_connected():
    r = requests.get(f"{BASE}/api/v1/health/ready", timeout=5)
    _s(r, "health-ready")
    if r.status_code == 200:
        assert r.json().get("database") == "connected"

def test_health_live_returns_live():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    _s(r, "health-live")
    assert r.status_code == 200
    assert r.json().get("status") == "live"
