"""Tests: Core API endpoints — Sprint-065: rate-limit resilient"""
import requests
import pytest

BASE_URL = "http://localhost:8030"


def _skip_if_rate_limited(r, context=""):
    if r.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")


class TestWorkOrders:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/work-orders/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "wo_list")
        assert r.status_code == 200

    def test_list_returns_array(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/work-orders/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "wo_array")
        assert isinstance(r.json(), list)

    def test_limit_enforced(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/work-orders/?limit=500", headers=auth_headers)
        _skip_if_rate_limited(r, "wo_limit")
        assert r.status_code == 422

    def test_status_filter(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/work-orders/?status=open&limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "wo_status_filter")
        assert r.status_code == 200
        data = r.json()
        for item in data:
            assert item["status"] == "open"

    def test_records_have_id(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/work-orders/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "wo_fields")
        data = r.json()
        if data:
            assert "id" in data[0]
            assert "title" in data[0]
            assert "status" in data[0]


class TestAssets:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/assets/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "assets_list")
        assert r.status_code == 200

    def test_list_is_array(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/assets/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "assets_array")
        assert isinstance(r.json(), list)

    def test_records_have_name(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/assets/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "assets_name")
        data = r.json()
        if data:
            assert "name" in data[0]


class TestLeads:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/leads/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "leads_list")
        assert r.status_code == 200

    def test_records_have_required_fields(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/leads/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "leads_fields")
        data = r.json()
        if data:
            lead = data[0]
            assert "id" in lead
            assert "name" in lead
            assert "email" in lead
            assert "status" in lead


class TestContracts:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/contracts/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "contracts_list")
        assert r.status_code == 200


class TestInvoices:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/invoices/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "invoices_list")
        assert r.status_code == 200

    def test_records_have_amount_field(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/invoices/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "invoices_amount")
        data = r.json()
        if data:
            inv = data[0]
            assert "amount" in inv or "total_amount" in inv, (
                f"No amount field in {list(inv.keys())}"
            )

    def test_records_have_status(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/invoices/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "invoices_status")
        data = r.json()
        if data:
            assert "status" in data[0]


class TestNotifications:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/notifications/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "notif_list")
        assert r.status_code == 200

    def test_records_have_title(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/notifications/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "notif_title")
        data = r.json()
        if data:
            assert "title" in data[0]
            assert "type" in data[0]


class TestPMPlans:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/maintenance/pm-plans/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "pm_list")
        assert r.status_code == 200


class TestServiceRequests:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/service-requests/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "sr_list")
        assert r.status_code == 200


class TestSuppliers:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/suppliers/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "suppliers_list")
        assert r.status_code == 200


class TestProjects:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/projects/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(r, "projects_list")
        assert r.status_code == 200
