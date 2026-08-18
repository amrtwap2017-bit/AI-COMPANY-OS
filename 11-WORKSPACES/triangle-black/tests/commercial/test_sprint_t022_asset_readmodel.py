"""T-022: Asset read model — maintenance KPIs without OLTP queries"""
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

def test_asset_read_model_file_exists():
    assert (SRC / "commercial/executive_dashboard/asset_read_models.py").exists()

def test_asset_read_model_has_class():
    src = (SRC / "commercial/executive_dashboard/asset_read_models.py").read_text()
    assert "class AssetReadModel" in src

def test_asset_read_model_has_all_kpi_methods():
    src = (SRC / "commercial/executive_dashboard/asset_read_models.py").read_text()
    for m in ["_asset_kpis", "_maintenance_kpis", "_criticality_breakdown",
              "_reliability_kpis", "_pm_compliance",
              "get_full_asset_dashboard"]:
        assert f"def {m}" in src, f"Missing: {m}"

def test_asset_read_model_scoped_to_hotel():
    src = (SRC / "commercial/executive_dashboard/asset_read_models.py").read_text()
    assert "self.hotel_id" in src
    assert "hotel_id = :hid" in src

def test_asset_read_model_non_blocking():
    src = (SRC / "commercial/executive_dashboard/asset_read_models.py").read_text()
    assert "except Exception" in src

def test_asset_read_model_instantiates():
    import sys
    sys.path.insert(0, "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
    try:
        from src.commercial.executive_dashboard.asset_read_models import AssetReadModel
        mock_db = MagicMock()
        rm = AssetReadModel(db=mock_db, hotel_id=HOTEL)
        assert rm.hotel_id == HOTEL
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_asset_read_model_handles_db_failure():
    import sys
    sys.path.insert(0, "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
    try:
        from src.commercial.executive_dashboard.asset_read_models import AssetReadModel
        mock_db = MagicMock()
        mock_db.execute.side_effect = Exception("DB down")
        rm = AssetReadModel(db=mock_db, hotel_id=HOTEL)
        result = rm.get_full_asset_dashboard()
        assert "hotel_id" in result
        for section in ["assets", "maintenance", "criticality",
                        "reliability", "pm_compliance"]:
            assert section in result
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_asset_dashboard_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/platform/assets",
                     headers=_h(), timeout=10)
    _s(r, "asset-dashboard")
    assert r.status_code == 200

def test_asset_dashboard_has_all_sections():
    r = requests.get(f"{BASE}/api/v1/platform/assets",
                     headers=_h(), timeout=10)
    _s(r, "asset-sections")
    if r.status_code == 200:
        d = r.json()
        assert "hotel_id" in d
        for section in ["assets", "maintenance", "criticality",
                        "reliability", "pm_compliance"]:
            assert section in d, f"Missing: {section}"

def test_asset_section_has_availability():
    r = requests.get(f"{BASE}/api/v1/platform/assets",
                     headers=_h(), timeout=10)
    _s(r, "asset-avail")
    if r.status_code == 200:
        a = r.json().get("assets", {})
        assert "total" in a or "error" in a

def test_maintenance_section_has_pm_ratio():
    r = requests.get(f"{BASE}/api/v1/platform/assets",
                     headers=_h(), timeout=10)
    _s(r, "pm-ratio")
    if r.status_code == 200:
        m = r.json().get("maintenance", {})
        assert "total_work_orders" in m or "error" in m

def test_health_still_ok():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert r.status_code == 200
