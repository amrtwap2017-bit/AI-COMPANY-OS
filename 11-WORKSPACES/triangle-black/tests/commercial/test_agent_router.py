"""
Agent router tests
"""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from src.commercial.agent_management.router import router
from src.commercial.agent_management.schemas import AgentResponse
from datetime import datetime


def make_fake_agent(**kwargs):
    defaults = dict(
        id="test-id-123",
        name="Test Agent",
        email="test@example.com",
        phone=None,
        company="Test Hotel",
        source="web",
        status="new",
        priority="medium",
        score=0,
        notes=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    defaults.update(kwargs)
    return MagicMock(**defaults)


@pytest.fixture
def client():
    app = FastAPI()
    fake_db = MagicMock()

    def override_db():
        return fake_db

    from src.commercial.agent_management.router import get_db
    app.dependency_overrides[get_db] = override_db
    app.include_router(router)
    return TestClient(app)


def test_create_agent(client):
    with patch(
        "src.commercial.agent_management.router.AgentRepository"
    ) as MockRepo:
        instance = MockRepo.return_value
        fake = make_fake_agent()
        instance.create.return_value = fake
        r = client.post(
            "/agents/",
            json={"name": "Test", "email": "t@t.com", "source": "web"},
        )
        assert r.status_code == 201


def test_list_agents(client):
    with patch(
        "src.commercial.agent_management.router.AgentRepository"
    ) as MockRepo:
        instance = MockRepo.return_value
        instance.list.return_value = []
        r = client.get("/agents/")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


def test_get_agent_not_found(client):
    with patch(
        "src.commercial.agent_management.router.AgentRepository"
    ) as MockRepo:
        instance = MockRepo.return_value
        instance.get.return_value = None
        r = client.get("/agents/nonexistent-id")
        assert r.status_code == 404
