"""
Tests: Core API endpoints
"""
import requests
import pytest

BASE_URL = "http://localhost:8030"


class TestWorkOrders:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/work-orders/?limit=5", headers=auth_headers)
        assert r.status_code == 200

    def test_list_returns_array(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/work-orders/?limit=5", headers=auth_headers)
        assert isinstance(r.json(), list)

    def test_limit_enforced(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/work-orders/?limit=500", headers=auth_headers)
        assert r.status_code == 422

    def test_status_filter(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/work-orders/?status=open&limit=5", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        for item in data:
            assert item["status"] == "open"

    def test_records_have_id(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/work-orders/?limit=5", headers=auth_headers)
        data = r.json()
        if data:
            assert "id" in data[0]
            assert "title" in data[0]
            assert "status" in data[0]


class TestAssets:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/assets/?limit=5", headers=auth_headers)
        assert r.status_code == 200

    def test_list_is_array(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/assets/?limit=5", headers=auth_headers)
        assert isinstance(r.json(), list)

    def test_records_have_name(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/assets/?limit=5", headers=auth_headers)
        data = r.json()
        if data:
            assert "name" in data[0]


class TestLeads:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/leads/?limit=5", headers=auth_headers)
        assert r.status_code == 200

    def test_records_have_required_fields(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/leads/?limit=5", headers=auth_headers)
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
        assert r.status_code == 200


class TestInvoices:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/invoices/?limit=5", headers=auth_headers)
        assert r.status_code == 200

    def test_records_have_amount_field(self, auth_headers):
        """Invoice may use amount or total_amount"""
        r = requests.get(f"{BASE_URL}/api/v1/invoices/?limit=5", headers=auth_headers)
        data = r.json()
        if data:
            inv = data[0]
            assert "amount" in inv or "total_amount" in inv, f"No amount field in {list(inv.keys())}"

    def test_records_have_status(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/invoices/?limit=5", headers=auth_headers)
        data = r.json()
        if data:
            assert "status" in data[0]


class TestNotifications:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/notifications/?limit=5", headers=auth_headers)
        assert r.status_code == 200

    def test_records_have_title(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/notifications/?limit=5", headers=auth_headers)
        data = r.json()
        if data:
            assert "title" in data[0]
            assert "type" in data[0]


class TestPMPlans:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/maintenance/pm-plans/?limit=5", headers=auth_headers)
        assert r.status_code == 200


class TestServiceRequests:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/service-requests/?limit=5", headers=auth_headers)
        assert r.status_code == 200


class TestSuppliers:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/suppliers/?limit=5", headers=auth_headers)
        assert r.status_code == 200


class TestProjects:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/projects/?limit=5", headers=auth_headers)
        assert r.status_code == 200
