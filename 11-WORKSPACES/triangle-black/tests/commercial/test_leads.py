"""Lead live API tests."""
import uuid, pytest

def test_list_leads(client, auth):
    res = client.get("/api/v1/leads/", headers=auth)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_leads_requires_auth(client):
    res = client.get("/api/v1/leads/")
    assert res.status_code == 401
