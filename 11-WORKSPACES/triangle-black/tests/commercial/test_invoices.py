"""Sprint-021: Invoices tests — clean rewrite"""
import pytest
import requests as _req


def test_list_invoices(client, auth_headers):
    res = client.get("/api/v1/invoices/?limit=10", headers=auth_headers)
    assert res.status_code == 200


def test_invoices_structure(client, auth_headers):
    res = client.get("/api/v1/invoices/?limit=5", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, (list, dict))


def test_invoices_with_auth_returns_200(client, auth_headers):
    res = client.get("/api/v1/invoices/?limit=5", headers=auth_headers)
    assert res.status_code == 200


def test_invoices_get_nonexistent(client, auth_headers):
    res = client.get("/api/v1/invoices/nonexistent-invoice-xyz", headers=auth_headers)
    assert res.status_code == 404


def test_invoices_have_fields(client, auth_headers):
    res = client.get("/api/v1/invoices/?limit=3", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    items = data if isinstance(data, list) else data.get("results", data.get("items", []))
    if items:
        inv = items[0]
        assert "id" in inv


def test_invoices_limit_param(client, auth_headers):
    res = client.get("/api/v1/invoices/?limit=1", headers=auth_headers)
    assert res.status_code == 200
