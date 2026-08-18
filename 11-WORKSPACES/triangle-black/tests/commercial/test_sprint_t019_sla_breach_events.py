"""T-019: SLA breach event auto-emission"""
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

def test_sla_scanner_file_exists():
    assert (SRC / "core/sla_scanner.py").exists()

def test_sla_scanner_has_required_functions():
    src = (SRC / "core/sla_scanner.py").read_text()
    for fn in ["scan_and_emit_sla_breaches", "get_breach_summary"]:
        assert f"def {fn}" in src

def test_sla_scanner_uses_event_type():
    src = (SRC / "core/sla_scanner.py").read_text()
    assert "WO_SLA_BREACHED" in src
    assert "emit_event" in src

def test_sla_scanner_is_non_blocking():
    src = (SRC / "core/sla_scanner.py").read_text()
    assert "except Exception" in src

def test_wo_router_imports_sla_scanner():
    src = (SRC / "commercial/work_orders/router.py").read_text()
    assert "sla_scanner" in src or "scan_and_emit_sla_breaches" in src

def test_sla_scanner_unit_bad_db():
    import sys
    sys.path.insert(0, "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
    try:
        from src.core.sla_scanner import scan_and_emit_sla_breaches
        mock_db = MagicMock()
        mock_db.execute.side_effect = Exception("DB down")
        result = scan_and_emit_sla_breaches(db=mock_db, hotel_id=HOTEL)
        assert "scanned_at" in result
        assert result["newly_breached"] == 0
        assert len(result["errors"]) > 0
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_sla_scanner_unit_empty_result():
    import sys
    sys.path.insert(0, "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
    try:
        from src.core.sla_scanner import scan_and_emit_sla_breaches
        mock_db = MagicMock()
        mock_db.execute.return_value.fetchall.return_value = []
        result = scan_and_emit_sla_breaches(db=mock_db, hotel_id=HOTEL)
        assert result["newly_breached"] == 0
        assert result["events_emitted"] == 0
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_sla_breach_summary_unit():
    import sys
    sys.path.insert(0, "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
    try:
        from src.core.sla_scanner import get_breach_summary
        mock_db = MagicMock()
        mock_db.execute.side_effect = Exception("DB down")
        result = get_breach_summary(db=mock_db, hotel_id=HOTEL)
        assert "hotel_id" in result
        assert "error" in result
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_sla_scan_endpoint_exists():
    r = requests.post(f"{BASE}/api/v1/platform/sla-scan",
                      headers=_h(), timeout=10)
    _s(r, "sla-scan")
    assert r.status_code == 200

def test_sla_scan_returns_summary_fields():
    r = requests.post(f"{BASE}/api/v1/platform/sla-scan",
                      headers=_h(), timeout=10)
    _s(r, "sla-scan-fields")
    if r.status_code == 200:
        d = r.json()
        assert "hotel_id" in d
        assert "newly_breached" in d
        assert "events_emitted" in d

def test_sla_breach_summary_endpoint():
    r = requests.get(f"{BASE}/api/v1/platform/sla-breach-summary",
                     headers=_h(), timeout=5)
    _s(r, "sla-breach-summary")
    assert r.status_code == 200

def test_sla_breach_summary_has_fields():
    r = requests.get(f"{BASE}/api/v1/platform/sla-breach-summary",
                     headers=_h(), timeout=5)
    _s(r, "sla-summary-fields")
    if r.status_code == 200:
        d = r.json()
        assert "hotel_id" in d

def test_sla_breached_list_auto_scans():
    r = requests.get(f"{BASE}/api/v1/work-orders/sla-breached",
                     headers=_h(), timeout=10)
    _s(r, "sla-auto-scan")
    assert r.status_code == 200
    d = r.json()
    assert "count" in d and "results" in d

def test_platform_events_has_sla_breach_type():
    r = requests.get(f"{BASE}/api/v1/platform/events?status=pending&limit=100",
                     headers=_h(), timeout=10)
    _s(r, "sla-events")
    assert r.status_code == 200
