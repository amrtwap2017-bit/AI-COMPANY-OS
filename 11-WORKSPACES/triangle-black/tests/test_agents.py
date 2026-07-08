"""Tests for agent endpoints."""
import uuid


def test_list_agents(client, auth):
    res = client.get("/api/v1/agents/", headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 3


def test_agents_have_capacity_fields(client, auth):
    res = client.get("/api/v1/agents/", headers=auth)
    agents = res.json()
    for agent in agents:
        assert "max_leads" in agent
        assert "current_leads" in agent
        assert agent["current_leads"] <= agent["max_leads"]


def test_get_agent_by_id(client, auth):
    agents = client.get("/api/v1/agents/", headers=auth).json()
    agent_id = agents[0]["id"]
    res = client.get(f"/api/v1/agents/{agent_id}", headers=auth)
    assert res.status_code == 200
    assert res.json()["id"] == agent_id


def test_get_agent_not_found(client, auth):
    res = client.get("/api/v1/agents/nonexistent-000", headers=auth)
    assert res.status_code == 404


def test_agent_leads_endpoint(client, auth):
    agents = client.get("/api/v1/agents/", headers=auth).json()
    agent_id = agents[0]["id"]
    res = client.get(f"/api/v1/actions/agents/{agent_id}/leads", headers=auth)
    assert res.status_code == 200


def test_agent_performance_endpoint(client, auth):
    agents = client.get("/api/v1/agents/", headers=auth).json()
    agent_id = agents[0]["id"]
    res = client.get(f"/api/v1/actions/agents/{agent_id}/performance", headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert "agent_id" in data or "agent" in data or "name" in data


def test_agents_requires_auth(client):
    res = client.get("/api/v1/agents/")
    assert res.status_code == 401
