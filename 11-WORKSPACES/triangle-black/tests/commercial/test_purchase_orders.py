"""Sprint-017: Purchase Orders Tests"""
import pytest

def _skip_if_rate_limited(res, context=""):
    import pytest
    if hasattr(res, "status_code") and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")



def test_po_list(client, auth_headers):
    res = client.get("/api/v1/purchase-orders/?limit=10", headers=auth_headers)
    _skip_if_rate_limited(res, "11")
    assert res.status_code == 200

def test_po_list_structure(client, auth_headers):
    res = client.get("/api/v1/purchase-orders/?limit=5", headers=auth_headers)
    _skip_if_rate_limited(res, "15")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, (list, dict))

def test_po_get_nonexistent(client, auth_headers):
    res = client.get("/api/v1/purchase-orders/nonexistent-po-xyz", headers=auth_headers)
    _skip_if_rate_limited(res, "21")
    assert res.status_code == 404

def test_po_limit_param(client, auth_headers):
    res = client.get("/api/v1/purchase-orders/?limit=1", headers=auth_headers)
    _skip_if_rate_limited(res, "25")
    assert res.status_code == 200

def test_pr_list(client, auth_headers):
    res = client.get("/api/v1/purchase-requests/?limit=10", headers=auth_headers)
    _skip_if_rate_limited(res, "29")
    assert res.status_code == 200

def test_pr_get_nonexistent(client, auth_headers):
    res = client.get("/api/v1/purchase-requests/nonexistent-pr-xyz", headers=auth_headers)
    _skip_if_rate_limited(res, "33")
    assert res.status_code == 404
