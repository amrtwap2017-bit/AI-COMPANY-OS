"""Sprint-081: DDD compliance — suppliers + warranty"""
import pytest


def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")


class TestSuppliersDDD:
    def test_model_importable(self):
        from src.commercial.suppliers.models import Supplier
        assert Supplier.__tablename__ == "suppliers"
        assert hasattr(Supplier, "hotel_id")

    def test_schemas_importable(self):
        from src.commercial.suppliers.schemas import SupplierCreate, SupplierResponse
        s = SupplierCreate(company_name="Test Supplier")
        assert s.company_name == "Test Supplier"

    def test_repository_importable(self):
        from src.commercial.suppliers.repository import get_all, get_by_id, create, update
        assert callable(get_all)

    def test_suppliers_api(self, client, auth_headers):
        res = client.get("/api/v1/suppliers/?limit=3", headers=auth_headers)
        _skip_if_rate_limited(res, "suppliers_list")
        assert res.status_code == 200


class TestWarrantyDDD:
    def test_model_importable(self):
        from src.commercial.warranty.models import AssetWarranty
        assert AssetWarranty.__tablename__ == "asset_warranties"
        assert hasattr(AssetWarranty, "hotel_id")

    def test_schemas_importable(self):
        from src.commercial.warranty.schemas import WarrantyCreate, WarrantyResponse
        w = WarrantyCreate(asset_id="test-001")
        assert w.asset_id == "test-001"

    def test_repository_importable(self):
        from src.commercial.warranty.repository import get_all, get_by_id, create
        assert callable(get_all)

    def test_warranty_api(self, client, auth_headers):
        res = client.get("/api/v1/warranty/", headers=auth_headers)
        _skip_if_rate_limited(res, "warranty_list")
        assert res.status_code in (200, 404)
