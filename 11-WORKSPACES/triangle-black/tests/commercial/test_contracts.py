"""Contract live API tests."""
import pytest

def test_list_contracts(client, auth):
    res = client.get("/api/v1/contracts/", headers=auth)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_contracts_requires_auth(client):
    import requests as _req
    r = _req.get(f"http://localhost:8030/api/v1/contracts/"", timeout=10)
    assert res.status_code == 401
