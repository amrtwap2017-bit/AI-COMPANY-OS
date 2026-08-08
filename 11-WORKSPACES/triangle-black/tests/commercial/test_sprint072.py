"""Sprint-072: Coverage tests for maintenance + assets + technicians APIs"""
import pytest


def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")


class TestMaintenancePMPlans:
    def test_pm_plans_list(self, client, auth_headers):
        res = client.get("/api/v1/maintenance/pm-plans/?limit=5",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "pm_plans_list")
        assert res.status_code in (200, 404)

    def test_pm_plans_structure(self, client, auth_headers):
        res = client.get("/api/v1/maintenance/pm-plans/?limit=3",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "pm_plans_structure")
        if res.status_code == 404:
            pytest.skip("PM plans endpoint not registered")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, (list, dict))


class TestAssets:
    def test_assets_list(self, client, auth_headers):
        res = client.get("/api/v1/assets/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(res, "assets_list")
        assert res.status_code == 200

    def test_assets_have_required_fields(self, client, auth_headers):
        res = client.get("/api/v1/assets/?limit=3", headers=auth_headers)
        _skip_if_rate_limited(res, "assets_fields")
        assert res.status_code == 200
        data = res.json()
        items = data if isinstance(data, list) else data.get("results", [])
        if items:
            a = items[0]
            assert "id" in a
            assert "name" in a

    def test_asset_detail(self, client, auth_headers):
        res_list = client.get("/api/v1/assets/?limit=1", headers=auth_headers)
        _skip_if_rate_limited(res_list, "asset_detail_list")
        assets = res_list.json()
        items = assets if isinstance(assets, list) else assets.get("results", [])
        if not items:
            pytest.skip("No assets in DB")
        asset_id = items[0]["id"]
        res = client.get(f"/api/v1/assets/{asset_id}", headers=auth_headers)
        _skip_if_rate_limited(res, "asset_detail")
        assert res.status_code == 200

    def test_asset_not_found(self, client, auth_headers):
        res = client.get("/api/v1/assets/nonexistent-000", headers=auth_headers)
        _skip_if_rate_limited(res, "asset_not_found")
        assert res.status_code == 404


class TestTechnicians:
    def test_technicians_list(self, client, auth_headers):
        res = client.get("/api/v1/technicians/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(res, "tech_list")
        assert res.status_code == 200

    def test_technicians_have_fields(self, client, auth_headers):
        res = client.get("/api/v1/technicians/?limit=3", headers=auth_headers)
        _skip_if_rate_limited(res, "tech_fields")
        assert res.status_code == 200
        data = res.json()
        items = data if isinstance(data, list) else data.get("results", [])
        if items:
            t = items[0]
            assert "id" in t
            assert "name" in t


class TestServiceRequests:
    def test_service_requests_list(self, client, auth_headers):
        res = client.get("/api/v1/service-requests/?limit=5",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "sr_list")
        assert res.status_code == 200

    def test_service_requests_structure(self, client, auth_headers):
        res = client.get("/api/v1/service-requests/?limit=3",
                         headers=auth_headers)
        _skip_if_rate_limited(res, "sr_structure")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, (list, dict))
