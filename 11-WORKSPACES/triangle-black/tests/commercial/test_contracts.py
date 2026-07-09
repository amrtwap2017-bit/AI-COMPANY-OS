"""Contract live API tests."""
import pytest

def test_list_contracts(client, auth):
    res = client.get("/api/v1/contracts/", headers=auth)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_contracts_requires_auth(client):
    res = client.get("/api/v1/contracts/")
    assert res.status_code == 401
