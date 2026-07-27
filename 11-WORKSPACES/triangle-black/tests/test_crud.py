"""
Tests: CRUD operations (create, read, update)
"""
import requests
import pytest
import uuid

BASE_URL = "http://localhost:8030"
HOTEL_ID = "tb-default-hotel-000000000001"


class TestWorkOrderCRUD:
    def test_create_work_order(self, auth_headers):
        payload = {
            "title": f"Test WO {uuid.uuid4().hex[:8]}",
            "description": "Automated test work order",
            "type": "corrective",
            "priority": "medium",
            "hotel_id": HOTEL_ID,
        }
        r = requests.post(f"{BASE_URL}/api/v1/work-orders/",
            json=payload, headers=auth_headers)
        assert r.status_code in [200, 201], f"Create failed: {r.text}"
        data = r.json()
        assert data.get("title") == payload["title"] or "id" in data
        return data.get("id")

    def test_create_requires_title(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/v1/work-orders/",
            json={"type": "corrective", "hotel_id": HOTEL_ID},
            headers=auth_headers)
        assert r.status_code == 422


class TestLeadCRUD:
    def test_create_lead(self, auth_headers):
        payload = {
            "name": f"Test Lead {uuid.uuid4().hex[:6]}",
            "email": f"test_{uuid.uuid4().hex[:6]}@test.com",
            "source": "web",
            "priority": "medium",
            "status": "new",
            "hotel_id": HOTEL_ID,
        }
        r = requests.post(f"{BASE_URL}/api/v1/leads/",
            json=payload, headers=auth_headers)
        assert r.status_code in [200, 201], f"Create failed: {r.text}"


class TestServiceRequestCRUD:
    def test_create_service_request(self, auth_headers):
        payload = {
            "title": f"Test SR {uuid.uuid4().hex[:8]}",
            "description": "Automated test service request",
            "category": "HVAC",
            "urgency": "medium",
            "hotel_id": HOTEL_ID,
        }
        r = requests.post(f"{BASE_URL}/api/v1/service-requests/",
            json=payload, headers=auth_headers)
        assert r.status_code in [200, 201], f"Create failed: {r.text}"
