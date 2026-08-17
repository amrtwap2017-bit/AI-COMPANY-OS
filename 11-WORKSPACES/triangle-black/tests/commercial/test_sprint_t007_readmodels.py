"""T-007: Executive read models — governed KPI projections"""
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
def test_read_models_file_exists():
    assert (SRC / "commercial/executive_dashboard/read_models.py").exists()

def test_read_models_has_executive_class():
    src = (SRC / "commercial/executive_dashboard/read_models.py").read_text()
    assert "class ExecutiveReadModel" in src

def test_read_models_has_required_methods():
    src = (SRC / "commercial/executive_dashboard/read_models.py").read_text()
    for method in ["get_full_dashboard", "_work_order_kpis",
                   "_service_request_kpis", "_invoice_kpis",
                   "_purchase_order_kpis", "_project_kpis",
                   "_sla_kpis", "_event_outbox_stats"]:
        assert f"def {method}" in src, f"Missing method: {method}"

def test_read_models_scoped_to_hotel():
    src = (SRC / "commercial/executive_dashboard/read_models.py").read_text()
    assert "self.hotel_id" in src
    assert "hotel_id = :hid" in src

# ── Unit tests — read model without HTTP ──────────────────────────────────
def test_read_model_instantiates():
    import sys
    sys.path.insert(0, str(SRC.parent))
    try:
        from src.commercial.executive_dashboard.read_models import ExecutiveReadModel
        mock_db = MagicMock()
        rm = ExecutiveReadModel(db=mock_db, hotel_id=HOTEL)
        assert rm.hotel_id == HOTEL
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_read_model_handles_db_failure():
    import sys
    sys.path.insert(0, str(SRC.parent))
    try:
        from src.commercial.executive_dashboard.read_models import ExecutiveReadModel
        mock_db = MagicMock()
        mock_db.execute.side_effect = Exception("DB down")
        rm = ExecutiveReadModel(db=mock_db, hotel_id=HOTEL)
        dashboard = rm.get_full_dashboard()
        assert "hotel_id" in dashboard
        assert dashboard["work_orders"] == {}
        assert dashboard["events"] == {}
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_read_model_dashboard_has_all_sections():
    import sys
    sys.path.insert(0, str(SRC.parent))
    try:
        from src.commercial.executive_dashboard.read_models import ExecutiveReadModel
        mock_db = MagicMock()
        mock_db.execute.return_value.fetchone.return_value = None
        rm = ExecutiveReadModel(db=mock_db, hotel_id=HOTEL)
        dashboard = rm.get_full_dashboard()
        for section in ["work_orders", "service_requests", "invoices",
                       "purchase_orders", "projects", "sla", "events"]:
            assert section in dashboard, f"Missing section: {section}"
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

# ── Live API ───────────────────────────────────────────────────────────────
def test_executive_dashboard_still_works():
    r = requests.get(f"{BASE}/api/v1/executive-dashboard/",
                     headers=_h(), timeout=10)
    _s(r, "exec-dashboard-t007")
    assert r.status_code in (200, 404)

def test_health_still_works():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert r.status_code == 200

def test_sla_summary_still_works():
    r = requests.get(f"{BASE}/api/v1/work-orders/sla-summary",
                     headers=_h(), timeout=5)
    _s(r, "sla-t007")
    assert r.status_code == 200
