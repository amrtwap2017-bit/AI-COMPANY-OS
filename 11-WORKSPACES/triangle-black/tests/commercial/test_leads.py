"""Tests for commercial leads endpoints."""
import uuid
import pytest

TEST_PREFIX = "TEST-PYTEST"


@pytest.fixture(scope="module")
def test_lead_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/leads/",
        json={
            "name": f"{TEST_PREFIX} {unique}",
            "email": f"commercial_{unique}@pytest.com",
            "source": "web",
            "priority": "medium",
        },
        headers=auth,
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    lead_id = res.json()["id"]
    yield lead_id
    client.delete(f"/api/v1/leads/{lead_id}", headers=auth)


def test_list_leads(client, auth):
    res = client.get("/api/v1/leads/", headers=auth)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_create_lead(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/leads/",
        json={
            "name": f"{TEST_PREFIX} Create {unique}",
            "email": f"create_{unique}@pytest.com",
            "source": "referral",
            "priority": "high",
        },
        headers=auth,
    )
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    assert data["status"] == "new"
    client.delete(f"/api/v1/leads/{data['id']}", headers=auth)


def test_get_lead(client, auth, test_lead_id):
    res = client.get(f"/api/v1/leads/{test_lead_id}", headers=auth)
    assert res.status_code == 200
    assert res.json()["id"] == test_lead_id


def test_get_lead_not_found(client, auth):
    res = client.get("/api/v1/leads/nonexistent-0000", headers=auth)
    assert res.status_code == 404


def test_update_lead(client, auth, test_lead_id):
    res = client.patch(
        f"/api/v1/leads/{test_lead_id}",
        json={"priority": "high", "notes": "Updated by commercial pytest"},
        headers=auth,
    )
    assert res.status_code == 200
    assert res.json()["priority"] == "high"


def test_leads_requires_auth(client):
    res = client.get("/api/v1/leads/")
    assert res.status_code == 401
