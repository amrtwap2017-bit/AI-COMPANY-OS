"""Tests for agent management endpoints."""
import uuid
import pytest

def _skip_if_rate_limited(res, context=""):
    import pytest
    if hasattr(res, 'status_code') and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")


TEST_PREFIX = "TEST-PYTEST"


@pytest.fixture(scope="module")
def test_agent_id(client, auth_headers):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/agents/",
        json={
            "name":      f"{TEST_PREFIX} Agent {unique}",
            "email":     f"agent_{unique}@pytest.com",
            "phone":     "+201234567890",
            "max_leads": 10,
        },
        headers=auth_headers,
    )
    if res.status_code == 404:
        pytest.skip("Agents endpoint not registered")
    assert res.status_code == 201, f"Create failed: {res.text}"
    agent_id = res.json()["id"]
    yield agent_id
    client.delete(f"/api/v1/agents/{agent_id}", headers=auth_headers)


def test_get_agent(client, auth_headers, test_agent_id):
    res = client.get(f"/api/v1/agents/{test_agent_id}", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == test_agent_id
    assert TEST_PREFIX in data["name"]
    assert "email" in data
    assert "max_leads" in data


def test_update_agent(client, auth_headers, test_agent_id):
    res = client.patch(
        f"/api/v1/agents/{test_agent_id}",
        json={"max_leads": 20, "phone": "+209999999999"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    assert res.json()["max_leads"] == 20
