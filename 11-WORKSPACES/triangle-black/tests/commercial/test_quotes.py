"""Quote live API tests."""
import pytest

def test_list_quotes(client, auth):
    res = client.get("/api/v1/quotes/", headers=auth)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_quotes_requires_auth(client):
    import requests as _req
    r = _req.get("http://localhost:8030/api/v1/quotes/", timeout=10)
    assert r.status_code in (401, 429)
