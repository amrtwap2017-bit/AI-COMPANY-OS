import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from src.main import app, get_db
from src.commercial.agent_management.models import Agent
from src.commercial.agent_management.repository import AgentRepository


def test_create_agent(client: TestClient):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/agents",
        json={"name": f"TEST-PYTEST {unique}", "max_leads": 20},
    )
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    agent_id = data["id"]
    client.delete(f"/api/v1/agents/{agent_id}")


def test_get_agents(client: TestClient):
    res = client.get("/api/v1/agents")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_agent(client: TestClient):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/agents",
        json={"name": f"TEST-PYTEST {unique}", "max_leads": 20},
    )
    assert res.status_code == 201
    data = res.json()
    agent_id = data["id"]
    res = client.get(f"/api/v1/agents/{agent_id}")
    assert res.status_code == 200
    assert res.json()["id"] == agent_id
    client.delete(f"/api/v1/agents/{agent_id}")


def test_get_agent_not_found(client: TestClient):
    res = client.get("/api/v1/agents/nonexistent-0000")
    assert res.status_code == 404


def test_update_agent(client: TestClient):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/agents",
        json={"name": f"TEST-PYTEST {unique}", "max_leads": 20},
    )
    assert res.status_code == 201
    data = res.json()
    agent_id = data["id"]
    res = client.patch(
        f"/api/v1/agents/{agent_id}",
        json={"max_leads": 30},
    )
    assert res.status_code == 200
    assert res.json()["max_leads"] == 30
    client.delete(f"/api/v1/agents/{agent_id}")


def test_requires_auth(client: TestClient):
    res = client.get("/api/v1/agents")
    assert res.status_code == 401