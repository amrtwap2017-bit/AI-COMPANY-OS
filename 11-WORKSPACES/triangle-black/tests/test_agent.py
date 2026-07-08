from fastapi.testclient import TestClient
from main import app
from sqlalchemy.orm import Session
from infrastructure.db.session import get_db, Base, engine
from application.services.agent import AgentService
from domain.models.agent import AgentCreate

Base.metadata.create_all(bind=engine)

def test_create_agent(client: TestClient):
    agent_data = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "max_leads": 10,
        "current_leads": 5
    }
    response = client.post("/agents", json=agent_data)
    assert response.status_code == 200
    agent = response.json()
    assert agent["name"] == agent_data["name"]
    assert agent["email"] == agent_data["email"]
    assert agent["max_leads"] == agent_data["max_leads"]
    assert agent["current_leads"] == agent_data["current_leads"]

def test_get_agent(client: TestClient):
    response = client.get("/agents/1")
    assert response.status_code == 200
    agent = response.json()
    assert agent["id"] == 1

def test_update_agent(client: TestClient):
    agent_data = {
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "max_leads": 20,
        "current_leads": 10
    }
    response = client.put("/agents/1", json=agent_data)
    assert response.status_code == 200
    agent = response.json()
    assert agent["name"] == agent_data["name"]
    assert agent["email"] == agent_data["email"]
    assert agent["max_leads"] == agent_data["max_leads"]
    assert agent["current_leads"] == agent_data["current_leads"]

def test_delete_agent(client: TestClient):
    response = client.delete("/agents/1")
    assert response.status_code == 200
    assert response.json() == {"detail": "Agent deleted"}