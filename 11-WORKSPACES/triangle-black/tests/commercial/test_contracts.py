"""Sprint-021: Contracts tests — clean rewrite"""
import pytest
import requests as _req


def test_list_contracts(client, auth_headers):
    res = client.get("/api/v1/contracts/?limit=10", headers=auth_headers)
    assert res.status_code == 200


def test_contracts_structure(client, auth_headers):
    res = client.get("/api/v1/contracts/?limit=5", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, (list, dict))


def test_contracts_requires_auth(client, auth_headers):
    r = _req.get("http://localhost:8030/api/v1/contracts/", timeout=10)
    assert r.status_code == 401


def test_contracts_get_nonexistent(client, auth_headers):
    res = client.get("/api/v1/contracts/nonexistent-xyz", headers=auth_headers)
    assert res.status_code == 404


def test_contracts_limit_param(client, auth_headers):
    res = client.get("/api/v1/contracts/?limit=1", headers=auth_headers)
    assert res.status_code == 200


def test_contracts_offset_param(client, auth_headers):
    res = client.get("/api/v1/contracts/?limit=10&offset=0", headers=auth_headers)
    assert res.status_code == 200
