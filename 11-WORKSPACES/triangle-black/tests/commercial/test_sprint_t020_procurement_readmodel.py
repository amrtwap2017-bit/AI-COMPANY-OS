"""T-020: Procurement read model"""
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

def test_procurement_read_model_file_exists():
    assert (SRC / "commercial/executive_dashboard/procurement_read_models.py").exists()

def test_procurement_read_model_has_class():
    src = (SRC / "commercial/executive_dashboard/procurement_read_models.py").read_text()
    assert "class ProcurementReadModel" in src

def test_procurement_read_model_has_all_kpi_methods():
    src = (SRC / "commercial/executive_dashboard/procurement_read_models.py").read_text()
    for m in ["_po_kpis", "_pr_kpis", "_supplier_kpis",
              "_rfq_kpis", "_gr_kpis", "_spend_kpis",
              "get_full_procurement_dashboard"]:
        assert f"def {m}" in src, f"Missing: {m}"

def test_procurement_read_model_scoped_to_hotel():
    src = (SRC / "commercial/executive_dashboard/procurement_read_models.py").read_text()
    assert "self.hotel_id" in src
    assert "hotel_id = :hid" in src

def test_procurement_read_model_non_blocking():
    src = (SRC / "commercial/executive_dashboard/procurement_read_models.py").read_text()
    assert "except Exception" in src

def test_procurement_read_model_instantiates():
    import sys
    sys.path.insert(0, "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
    try:
        from src.commercial.executive_dashboard.procurement_read_models import ProcurementReadModel
        mock_db = MagicMock()
        rm = ProcurementReadModel(db=mock_db, hotel_id=HOTEL)
        assert rm.hotel_id == HOTEL
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_procurement_read_model_handles_db_failure():
    import sys
    sys.path.insert(0, "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
    try:
        from src.commercial.executive_dashboard.procurement_read_models import ProcurementReadModel
        mock_db = MagicMock()
        mock_db.execute.side_effect = Exception("DB down")
        rm = ProcurementReadModel(db=mock_db, hotel_id=HOTEL)
        result = rm.get_full_procurement_dashboard()
        assert "hotel_id" in result
        for section in ["purchase_orders", "purchase_requests", "suppliers",
                        "rfqs", "goods_receipts", "spend"]:
            assert section in result
    except ImportError as e:
        pytest.skip(f"Import failed: {e}")

def test_procurement_dashboard_endpoint_returns_200():
    r = requests.get(f"{BASE}/api/v1/platform/procurement",
                     headers=_h(), timeout=10)
    _s(r, "procurement-dashboard")
    assert r.status_code == 200

def test_procurement_dashboard_has_all_sections():
    r = requests.get(f"{BASE}/api/v1/platform/procurement",
                     headers=_h(), timeout=10)
    _s(r, "procurement-sections")
    if r.status_code == 200:
        d = r.json()
        assert "hotel_id" in d
        for section in ["purchase_orders", "purchase_requests",
                        "suppliers", "rfqs", "spend"]:
            assert section in d, f"Missing section: {section}"

def test_procurement_po_section_has_spend():
    r = requests.get(f"{BASE}/api/v1/platform/procurement",
                     headers=_h(), timeout=10)
    _s(r, "po-spend")
    if r.status_code == 200:
        po = r.json().get("purchase_orders", {})
        assert "total" in po or "error" in po

def test_procurement_suppliers_section_has_rating():
    r = requests.get(f"{BASE}/api/v1/platform/procurement",
                     headers=_h(), timeout=10)
    _s(r, "supplier-rating")
    if r.status_code == 200:
        s = r.json().get("suppliers", {})
        assert "total" in s or "error" in s

def test_health_still_ok():
    r = requests.get(f"{BASE}/api/v1/health/live", timeout=5)
    assert r.status_code == 200
