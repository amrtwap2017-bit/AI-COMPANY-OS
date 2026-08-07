import requests

def _skip_if_rate_limited(r, context=""):
    import pytest
    if hasattr(r, 'status_code') and r.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")


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


def test_protected_endpoint_requires_auth():
    """Test without auth headers - client fixture adds auth so we use raw requests."""
    res = requests.get("http://localhost:8030/api/v1/leads/", timeout=10)
    assert res.status_code == 401, f"Expected 401 but got {res.status_code}: {res.text[:100]}"
