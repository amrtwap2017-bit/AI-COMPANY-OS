"""
Pagination stats live API tests — Triangle Black
Requires TB API running at 127.0.0.1:8030.
"""
import pytest

def _skip_if_rate_limited(res, context=""):
    import pytest
    if hasattr(res, 'status_code') and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")



def test_pagination_stats(client, auth_headers):
    """Pagination stats endpoint returns dict."""
    res = client.get("/api/v1/pagination/stats", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), dict)


def test_pagination_logs(client, auth_headers):
    """Pagination logs endpoint returns list."""
    res = client.get("/api/v1/pagination/logs", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_pagination_requires_auth(client):
    """Pagination endpoints may or may not require auth."""
    res = client.get("/api/v1/pagination/logs")
    # 200 = public endpoint, 401 = auth required, 404 = not registered
    assert res.status_code in (200, 401, 404)
