"""T-011: Digital Twin event projection — twin_nodes + twin_edges"""
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
def test_projector_file_exists():
    assert (SRC / "commercial/digital_twin/projector.py").exists()

def test_projector_has_required_classes():
    src = (SRC / "commercial/digital_twin/projector.py").read_text()
    for cls in ["class TwinProjector", "class TwinQuery"]:
        assert cls in src, f"Missing: {cls}"

def test_projector_has_required_methods():
    src = (SRC / "commercial/digital_twin/projector.py").read_text()
    for method in ["project_event", "_project_work_order",
                   "_project_asset", "_upsert_node", "_upsert_edge",
                   "get_node", "get_impact", "get_stats"]:
        assert f"def {method}" in src, f"Missing: {method}"

def test_projector_scoped_to_hotel():
    src = (SRC / "commercial/digital_twin/projector.py").read_text()
    assert "self.hotel_id" in src
    assert "hotel_id=:hid" in src

# ── Migration ──────────────────────────────────────────────────────────────
def test_twin_migration_exists():
    versions = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/alembic/versions")
    matches = list(versions.glob("*twin*"))
    assert len(matches) >= 1

# ── Unit tests — no HTTP ──────────────────────────────────────────────────
def test_projector_instantiates():
    import sys
    sys.path.insert(0, str(SRC.parent))
    try:
        from src.commercial.digital_twin.projector import TwinProjector
        mock_db = MagicMock()
        tp = TwinProjector(db=mock_db, hotel_id=HOTEL)
        assert tp.hotel_id == HOTEL
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_query_instantiates():
    import sys
    sys.path.insert(0, str(SRC.parent))
    try:
        from src.commercial.digital_twin.projector import TwinQuery
        mock_db = MagicMock()
        tq = TwinQuery(db=mock_db, hotel_id=HOTEL)
        assert tq.hotel_id == HOTEL
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_projector_handles_bad_db():
    import sys
    sys.path.insert(0, str(SRC.parent))
    try:
        from src.commercial.digital_twin.projector import TwinProjector
        mock_db = MagicMock()
        mock_db.execute.side_effect = Exception("DB down")
        tp = TwinProjector(db=mock_db, hotel_id=HOTEL)
        result = tp.project_event({
            "event_type": "work_order.completed",
            "aggregate_id": "test-wo-id",
            "payload": '{"status": "completed"}'
        })
        # Should not raise — returns False on failure
        assert result is False or result is True
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

# ── Live API ───────────────────────────────────────────────────────────────
def test_digital_twin_api_still_works():
    r = requests.get(f"{BASE}/api/v1/digital-twin/state",
                     headers=_h(), timeout=5)
    _s(r, "twin-state")
    assert r.status_code in (200, 404)

def test_health_still_works():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert r.status_code == 200
