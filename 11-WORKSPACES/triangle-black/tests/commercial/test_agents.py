"""
Agent endpoint tests — Triangle Black live API tests.
Requires: TB API running at 127.0.0.1:8030 and authenticated client fixture.
"""
import uuid
import pytest

TEST_PREFIX = "TEST-PYTEST"


@pytest.fixture(scope="module")
def test_agent_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/agents/",
        json={"name": f"{TEST_PREFIX} {unique}", "status": "active"},
        headers=auth,
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    obj_id = res.json()["id"]
    yield obj_id
    client.delete(f"/api/v1/agents/{obj_id}", headers=auth)


def test_list_agents(client, auth):
    res = client.get("/api/v1/agents/", headers=auth)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_create_agent(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/agents/",
        json={"name": f"{TEST_PREFIX} Create {unique}"},
        headers=auth,
    )
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    assert data["status"] == "active"
    client.delete(f"/api/v1/agents/{data['id']}", headers=auth)


def test_get_agent(client, auth, test_agent_id):
    res = client.get(f"/api/v1/agents/{test_agent_id}", headers=auth)
    assert res.status_code == 200
    assert res.json()["id"] == test_agent_id


def test_get_agent_not_found(client, auth):
    res = client.get("/api/v1/agents/nonexistent-0000", headers=auth)
    assert res.status_code == 404


def test_update_agent(client, auth, test_agent_id):
    res = client.patch(
        f"/api/v1/agents/{test_agent_id}",
        json={"status": "inactive"},
        headers=auth,
    )
    assert res.status_code == 200
    assert res.json()["status"] == "inactive"


def test_agents_requires_auth(client):
    res = client.get("/api/v1/agents/")
    assert res.status_code == 401
