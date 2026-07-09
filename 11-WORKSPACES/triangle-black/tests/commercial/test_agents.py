"""Agent live API tests."""
import uuid, pytest

TEST_PREFIX = "TEST-PYTEST"

@pytest.fixture(scope="module")
def test_agent_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post("/api/v1/agents/", json={"name": f"{TEST_PREFIX} {unique}", "email": f"{unique}@test.com"}, headers=auth)
    assert res.status_code in (200, 201), f"Create failed: {res.text}"
    return res.json()["id"]

def test_list_agents(client, auth):
    res = client.get("/api/v1/agents/", headers=auth)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_get_agent(client, auth, test_agent_id):
    res = client.get(f"/api/v1/agents/{test_agent_id}", headers=auth)
    assert res.status_code == 200

def test_agents_requires_auth(client):
    res = client.get("/api/v1/agents/")
    assert res.status_code == 401
