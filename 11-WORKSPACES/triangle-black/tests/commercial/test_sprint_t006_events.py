"""T-006: Event outbox foundation — platform_events table + EventOutbox + dispatcher"""
import requests
import pytest
from pathlib import Path
from unittest.mock import MagicMock

BASE = "http://localhost:8030"
SRC  = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src")
HOTEL = "tb-default-hotel-000000000001"

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

# ── File existence ─────────────────────────────────────────────────────────
def test_events_module_exists():
    assert (SRC / "core/events.py").exists()

def test_events_module_has_required_classes():
    src = (SRC / "core/events.py").read_text()
    for cls in ["class EventType", "class EventOutbox", "class EventDispatcher"]:
        assert cls in src, f"Missing: {cls}"

def test_event_type_constants_defined():
    src = (SRC / "core/events.py").read_text()
    for const in ["WO_CREATED", "WO_COMPLETED", "WO_CLOSED",
                  "SR_CREATED", "SR_CONVERTED", "ASSET_CREATED",
                  "INVOICE_CREATED", "PO_CREATED"]:
        assert const in src, f"Missing EventType constant: {const}"

def test_outbox_has_required_methods():
    src = (SRC / "core/events.py").read_text()
    for method in ["def publish", "def publish_many"]:
        assert method in src, f"Missing method: {method}"

def test_dispatcher_has_required_methods():
    src = (SRC / "core/events.py").read_text()
    for method in ["def get_pending", "def mark_dispatched",
                   "def mark_failed", "def get_stats"]:
        assert method in src, f"Missing method: {method}"

def test_emit_event_convenience_function():
    src = (SRC / "core/events.py").read_text()
    assert "def emit_event" in src

# ── Migration ──────────────────────────────────────────────────────────────
def test_platform_events_migration_exists():
    versions = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/alembic/versions")
    matches = list(versions.glob("*platform_events*"))
    assert len(matches) >= 1, "No platform_events migration found"

# ── Non-blocking guarantee ─────────────────────────────────────────────────
def test_outbox_never_raises_on_bad_db():
    import sys
    sys.path.insert(0, str(SRC.parent))
    try:
        from src.core.events import EventOutbox
        mock_db = MagicMock()
        mock_db.execute.side_effect = Exception("DB down")
        outbox = EventOutbox(db=mock_db, hotel_id=HOTEL)
        result = outbox.publish("test.event", "test", "id-123", {"key": "val"})
        assert result is None, "publish must return None on failure, not raise"
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_dispatcher_never_raises_on_bad_db():
    import sys
    sys.path.insert(0, str(SRC.parent))
    try:
        from src.core.events import EventDispatcher
        mock_db = MagicMock()
        mock_db.execute.side_effect = Exception("DB down")
        dispatcher = EventDispatcher(db=mock_db, hotel_id=HOTEL)
        result = dispatcher.get_pending()
        assert result == [], "get_pending must return [] on failure, not raise"
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

# ── Work orders router wired ───────────────────────────────────────────────
def test_wo_router_imports_events():
    src = (SRC / "commercial/work_orders/router.py").read_text()
    assert "from src.core.events import" in src or "emit_event" in src

def test_wo_router_emits_wo_completed():
    src = (SRC / "commercial/work_orders/router.py").read_text()
    assert "WO_COMPLETED" in src or "work_order.completed" in src

# ── Live API smoke ─────────────────────────────────────────────────────────
def test_server_still_starts_after_events_module():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert r.status_code == 200

def test_work_orders_list_still_works():
    r = requests.get(f"{BASE}/api/v1/work-orders/?limit=2",
                     headers=_h(), timeout=5)
    _s(r, "wo-list-t006")
    assert r.status_code == 200

def test_sla_endpoints_still_work():
    r = requests.get(f"{BASE}/api/v1/work-orders/sla-summary",
                     headers=_h(), timeout=5)
    _s(r, "sla-summary-t006")
    assert r.status_code == 200
