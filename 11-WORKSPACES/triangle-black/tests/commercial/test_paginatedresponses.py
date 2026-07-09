"""
Pagination stats live API tests — Triangle Black
Requires TB API running at 127.0.0.1:8030.
"""
import pytest


def test_pagination_stats(client, auth):
    """Pagination stats endpoint returns dict."""
    res = client.get("/api/v1/pagination/stats", headers=auth)
    assert res.status_code == 200
    assert isinstance(res.json(), dict)


def test_pagination_logs(client, auth):
    """Pagination logs endpoint returns list."""
    res = client.get("/api/v1/pagination/logs", headers=auth)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_pagination_requires_auth(client):
    """Pagination endpoints require authentication."""
    res = client.get("/api/v1/pagination/logs")
    assert res.status_code == 401
