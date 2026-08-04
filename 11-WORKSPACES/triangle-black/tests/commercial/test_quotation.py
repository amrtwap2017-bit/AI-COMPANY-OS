"""Sprint-017: Quotation Tests"""
import pytest


def test_quotes_list(client, auth_headers):
    res = client.get("/api/v1/quotes/?limit=10", headers=auth_headers)
    assert res.status_code == 200

def test_quotes_list_structure(client, auth_headers):
    res = client.get("/api/v1/quotes/?limit=5", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, (list, dict))

def test_quotes_filter_status(client, auth_headers):
    res = client.get("/api/v1/quotes/?status=draft&limit=10", headers=auth_headers)
    assert res.status_code in (200, 422)

def test_quotes_get_nonexistent(client, auth_headers):
    res = client.get("/api/v1/quotes/nonexistent-quote-xyz", headers=auth_headers)
    assert res.status_code == 404

def test_quotes_limit_param(client, auth_headers):
    res = client.get("/api/v1/quotes/?limit=1", headers=auth_headers)
    assert res.status_code == 200

def test_quotes_offset_param(client, auth_headers):
    res = client.get("/api/v1/quotes/?limit=10&offset=0", headers=auth_headers)
    assert res.status_code == 200
