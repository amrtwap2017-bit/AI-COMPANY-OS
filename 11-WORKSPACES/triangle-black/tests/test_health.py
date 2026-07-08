"""Tests for health endpoint and basic API availability."""


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert data["service"] == "triangle-black-api"
    assert data["database"] == "connected"
    assert "version" in data


def test_root(client):
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert "service" in data
    assert "version" in data


def test_docs_available(client):
    res = client.get("/docs")
    assert res.status_code == 200


def test_protected_endpoint_requires_auth(client):
    res = client.get("/api/v1/leads/")
    assert res.status_code == 401
