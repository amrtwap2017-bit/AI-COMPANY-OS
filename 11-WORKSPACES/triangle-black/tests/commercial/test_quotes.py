"""Quote live API tests."""
import pytest

def test_list_quotes(client, auth):
    res = client.get("/api/v1/quotes/", headers=auth)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_quotes_requires_auth(client):
    import requests as _req
    r = _req.get(f"http://localhost:8030/api/v1/quotes/"", timeout=10)
    assert res.status_code == 401
