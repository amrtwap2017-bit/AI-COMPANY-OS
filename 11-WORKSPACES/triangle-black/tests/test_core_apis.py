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


class TestAssets:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/assets/?limit=5", headers=auth_headers)
        assert r.status_code == 200

    def test_list_is_array(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/assets/?limit=5", headers=auth_headers)
        assert isinstance(r.json(), list)


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

    def test_records_have_amount(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/invoices/?limit=5", headers=auth_headers)
        data = r.json()
        if data:
            assert "amount" in data[0]


class TestNotifications:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/notifications/?limit=5", headers=auth_headers)
        assert r.status_code == 200


class TestPMPlans:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/maintenance/pm-plans/?limit=5", headers=auth_headers)
        assert r.status_code == 200


class TestServiceRequests:
    def test_list_returns_200(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/v1/service-requests/?limit=5", headers=auth_headers)
        assert r.status_code == 200
