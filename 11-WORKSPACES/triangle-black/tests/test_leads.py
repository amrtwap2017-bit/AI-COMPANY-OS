"""Tests for lead CRUD endpoints."""
import uuid
import pytest

TEST_PREFIX = "TEST-PYTEST"


@pytest.fixture(scope="module")
def test_lead_id(client, auth):
    """Create a test lead and return its ID. Clean up after module."""
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/leads/",
        json={
            "name": f"{TEST_PREFIX} Hotel {unique}",
            "email": f"test_{unique}@pytest-hotel.com",
            "company": "Pytest Hotels",
            "source": "web",
            "priority": "medium",
            "phone": "+201234567890",
            "notes": "HVAC and electrical maintenance needed",
        },
        headers=auth,
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    lead_id = res.json()["id"]
    yield lead_id
    client.delete(f"/api/v1/leads/{lead_id}", headers=auth)


def test_list_leads_returns_results(client, auth):
    res = client.get("/api/v1/leads/", headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_create_lead(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/leads/",
        json={
            "name": f"{TEST_PREFIX} Create {unique}",
            "email": f"create_{unique}@pytest.com",
            "company": "Create Test Hotel",
            "source": "referral",
            "priority": "high",
            "phone": "+201111111111",
        },
        headers=auth,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == f"create_{unique}@pytest.com"
    assert data["source"] == "referral"
    assert data["status"] == "new"
    client.delete(f"/api/v1/leads/{data['id']}", headers=auth)


def test_get_lead(client, auth, test_lead_id):
    res = client.get(f"/api/v1/leads/{test_lead_id}", headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == test_lead_id
    assert TEST_PREFIX in data["name"]


def test_get_lead_not_found(client, auth):
    res = client.get("/api/v1/leads/nonexistent-id-0000", headers=auth)
    assert res.status_code == 404


def test_update_lead(client, auth, test_lead_id):
    res = client.patch(
        f"/api/v1/actions/leads/{test_lead_id}",
        json={"priority": "high", "notes": "Updated by pytest"},
        headers=auth,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["priority"] == "high"


def test_list_leads_requires_auth():
    import requests as _req
    res = _req.get("http://localhost:8030/api/v1/leads/", timeout=10)
    assert res.status_code == 401


def test_seed_data_exists(client, auth):
    res = client.get("/api/v1/leads/?limit=100", headers=auth)
    leads = res.json()
    assert len(leads) >= 15, f"Expected at least 15 seeded leads, got {len(leads)}"
