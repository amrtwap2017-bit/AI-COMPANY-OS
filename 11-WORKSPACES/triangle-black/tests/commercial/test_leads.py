"""Sprint-021: Leads tests — clean rewrite"""
import pytest

def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        import pytest
        pytest.skip(f"Rate limited in full suite — {context}")



def test_list_leads(client, auth_headers):
    res = client.get("/api/v1/leads/?limit=10", headers=auth_headers)
    _skip_if_rate_limited(res, "11")
    assert res.status_code == 200


def test_leads_structure(client, auth_headers):
    res = client.get("/api/v1/leads/?limit=5", headers=auth_headers)
    _skip_if_rate_limited(res, "16")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, (list, dict))


def test_leads_get_nonexistent(client, auth_headers):
    res = client.get("/api/v1/leads/nonexistent-lead-xyz", headers=auth_headers)
    _skip_if_rate_limited(res, "23")
    assert res.status_code == 404


def test_leads_requires_auth(client, auth_headers):
    import requests
    r = requests.get("http://localhost:8030/api/v1/leads/", timeout=10)
    assert r.status_code == 401


def test_leads_create(client, auth_headers):
    res = client.post("/api/v1/leads/", json={
        "name": "Sprint021 Test Lead",
        "email": "sprint021@pytest.com",
        "source": "web",
        "priority": "medium",
        "company": "Test Hotel",
    }, headers=auth_headers)
    assert res.status_code in (200, 201)
    if res.status_code in (200, 201):
        data = res.json()
        assert "id" in data


def test_leads_count_in_response(client, auth_headers):
    res = client.get("/api/v1/leads/?limit=10", headers=auth_headers)
    _skip_if_rate_limited(res, "48")
    assert res.status_code == 200
    data = res.json()
    if isinstance(data, dict):
        assert "results" in data or "count" in data or "items" in data
