import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from src.main import app, get_db
from src.core.auth import create_access_token
from src.commercial.hotels.models import Hotel
from src.commercial.leads.models import Lead
from src.commercial.agents.models import Agent
from src.commercial.quotes.models import Quote


test_prefix = "TEST-PYTEST"


@pytest.fixture(scope="module")
def test_hotel_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/hotels/",
        json={"name": f"{test_prefix} {unique}", "code": "CODE123", "address": "123 Main St", "subscription_tier": "Basic"},
        headers=auth,
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    hotel_id = res.json()["id"]
    yield hotel_id
    client.delete(f"/api/v1/hotels/{hotel_id}", headers=auth)


@pytest.fixture(scope="module")
def test_lead_id(client, auth, test_hotel_id):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/leads",
        json={"name": f"{test_prefix} {unique}", "hotel_id": test_hotel_id},
        headers=auth,
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    lead_id = res.json()["id"]
    yield lead_id
    client.delete(f"/api/v1/leads/{lead_id}", headers=auth)


@pytest.fixture(scope="module")
def test_agent_id(client, auth, test_hotel_id):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/agents",
        json={"name": f"{test_prefix} {unique}", "hotel_id": test_hotel_id},
        headers=auth,
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    agent_id = res.json()["id"]
    yield agent_id
    client.delete(f"/api/v1/agents/{agent_id}", headers=auth)


@pytest.fixture(scope="module")
def test_quote_id(client, auth, test_hotel_id):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/quotes",
        json={"name": f"{test_prefix} {unique}", "hotel_id": test_hotel_id},
        headers=auth,
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    quote_id = res.json()["id"]
    yield quote_id
    client.delete(f"/api/v1/quotes/{quote_id}", headers=auth)


def test_create_hotel(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/hotels",
        json={"name": f"{test_prefix} {unique}", "code": "CODE123", "address": "123 Main St", "subscription_tier": "Basic"},
        headers=auth,
    )
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    client.delete(f"/api/v1/hotels/{data["id"]}", headers=auth)


def test_get_hotel(client, auth, test_hotel_id):
    res = client.get(f"/api/v1/hotels/{test_hotel_id}", headers=auth)
    assert res.status_code == 200
    assert res.json()["id"] == test_hotel_id


def test_get_hotel_not_found(client, auth):
    res = client.get("/api/v1/hotels/nonexistent-0000", headers=auth)
    assert res.status_code == 404


def test_update_hotel(client, auth, test_hotel_id):
    res = client.patch(
        f"/api/v1/hotels/{test_hotel_id}",
        json={"code": "NEWCODE"},
        headers=auth,
    )
    assert res.status_code == 200
    assert res.json()["code"] == "NEWCODE"


def test_delete_hotel(client, auth, test_hotel_id):
    res = client.delete(f"/api/v1/hotels/{test_hotel_id}", headers=auth)
    assert res.status_code == 204


def test_list_hotels(client, auth, test_hotel_id):
    res = client.get("/api/v1/hotels", headers=auth)
    assert res.status_code == 200
    hotels = res.json()
    assert len(hotels) > 0
    for hotel in hotels:
        assert hotel["id"] == test_hotel_id


def test_lead_hotel_filter(client, auth, test_hotel_id, test_lead_id):
    res = client.get(f"/api/v1/hotels/{test_hotel_id}/leads", headers=auth)
    assert res.status_code == 200
    leads = res.json()
    assert len(leads) > 0
    for lead in leads:
        assert lead["id"] == test_lead_id


def test_agent_hotel_filter(client, auth, test_hotel_id, test_agent_id):
    res = client.get(f"/api/v1/hotels/{test_hotel_id}/agents", headers=auth)
    assert res.status_code == 200
    agents = res.json()
    assert len(agents) > 0
    for agent in agents:
        assert agent["id"] == test_agent_id


def test_quote_hotel_filter(client, auth, test_hotel_id, test_quote_id):
    res = client.get(f"/api/v1/hotels/{test_hotel_id}/quotes", headers=auth)
    assert res.status_code == 200
    quotes = res.json()
    assert len(quotes) > 0
    for quote in quotes:
        assert quote["id"] == test_quote_id