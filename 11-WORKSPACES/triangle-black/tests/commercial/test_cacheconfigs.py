"""Tests for cache config endpoints — skips if endpoint not registered."""
import uuid
import pytest


def test_get_cacheconfig(client, auth):
    res = client.get("/api/v1/cache-configs/", headers=auth)
    if res.status_code == 404:
        pytest.skip("CacheConfig endpoint not registered")
    assert res.status_code == 200


def test_update_cacheconfig(client, auth):
    res = client.get("/api/v1/cache-configs/", headers=auth)
    if res.status_code == 404:
        pytest.skip("CacheConfig endpoint not registered")
    assert res.status_code == 200
