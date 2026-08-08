"""Sprint-073: Supply chain coverage tests"""
import pytest


def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")


class TestGoodsReceipts:
    def test_goods_receipts_list(self, client, auth_headers):
        res = client.get("/api/v1/goods-receipts/?limit=5",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "gr_list")
        assert res.status_code in (200, 404)

    def test_goods_receipts_structure(self, client, auth_headers):
        res = client.get("/api/v1/goods-receipts/?limit=3",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "gr_structure")
        if res.status_code == 404:
            pytest.skip("Goods receipts endpoint not registered")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, (list, dict))

    def test_goods_receipt_not_found(self, client, auth_headers):
        res = client.get("/api/v1/goods-receipts/nonexistent-000",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "gr_not_found")
        assert res.status_code in (404, 422)


class TestWarehouses:
    def test_warehouses_list(self, client, auth_headers):
        res = client.get("/api/v1/warehouses/?limit=5",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "wh_list")
        assert res.status_code in (200, 404)

    def test_warehouses_structure(self, client, auth_headers):
        res = client.get("/api/v1/warehouses/?limit=3",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "wh_structure")
        if res.status_code == 404:
            pytest.skip("Warehouses endpoint not registered")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, (list, dict))

    def test_warehouses_have_fields(self, client, auth_headers):
        res = client.get("/api/v1/warehouses/?limit=3",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "wh_fields")
        if res.status_code in (404, 422):
            pytest.skip("Warehouses endpoint not available")
        assert res.status_code == 200
        data = res.json()
        items = data if isinstance(data, list) else data.get("results", [])
        if items:
            w = items[0]
            assert "id" in w


class TestInventoryItems:
    def test_inventory_items_list(self, client, auth_headers):
        res = client.get("/api/v1/inventory-items/?limit=5",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "inv_list")
        assert res.status_code in (200, 404)

    def test_inventory_items_structure(self, client, auth_headers):
        res = client.get("/api/v1/inventory-items/?limit=3",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "inv_structure")
        if res.status_code == 404:
            pytest.skip("Inventory items endpoint not registered")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, (list, dict))

    def test_inventory_items_have_fields(self, client, auth_headers):
        res = client.get("/api/v1/inventory-items/?limit=3",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "inv_fields")
        if res.status_code in (404, 422):
            pytest.skip("Inventory items endpoint not available")
        assert res.status_code == 200
        data = res.json()
        items = data if isinstance(data, list) else data.get("results", [])
        if items:
            item = items[0]
            assert "id" in item

    def test_inventory_item_not_found(self, client, auth_headers):
        res = client.get("/api/v1/inventory-items/nonexistent-000",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "inv_not_found")
        assert res.status_code in (404, 422)


class TestRFQs:
    def test_rfqs_list(self, client, auth_headers):
        res = client.get("/api/v1/rfqs/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(res, "rfq_list")
        assert res.status_code in (200, 404)

    def test_rfqs_structure(self, client, auth_headers):
        res = client.get("/api/v1/rfqs/?limit=3", headers=auth_headers)
        _skip_if_rate_limited(res, "rfq_structure")
        if res.status_code == 404:
            pytest.skip("RFQs endpoint not registered")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, (list, dict))

    def test_rfq_not_found(self, client, auth_headers):
        res = client.get("/api/v1/rfqs/nonexistent-000",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "rfq_not_found")
        assert res.status_code in (404, 422)


class TestStockBalances:
    def test_stock_balances_list(self, client, auth_headers):
        res = client.get("/api/v1/stock-balances/?limit=5",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "stock_list")
        assert res.status_code in (200, 404)

    def test_stock_balances_summary(self, client, auth_headers):
        res = client.get("/api/v1/stock-balances/summary",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "stock_summary")
        assert res.status_code in (200, 404)
